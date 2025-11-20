import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, FAB, Portal, useTheme } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GetFormatterForCurrency } from '@/lib/currencies';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const [fabOpen, setFabOpen] = useState(false);

  const { data: userSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('UserSettings')
        .select('*')
        .eq('userId', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions, error } = await supabase
        .from('Transaction')
        .select('*')
        .eq('userId', user?.id)
        .gte('date', startOfMonth.toISOString());

      if (error) throw error;

      const income = transactions
        ?.filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      const expense = transactions
        ?.filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      const savings = transactions
        ?.filter((t) => t.type === 'savings')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      const balance = income - expense - savings;

      return { income, expense, savings, balance };
    },
    enabled: !!user?.id,
  });

  const { data: cumulativeSavings } = useQuery({
    queryKey: ['cumulative-savings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('CumulativeSavings')
        .select('*')
        .eq('userId', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data?.totalSavings || 0;
    },
    enabled: !!user?.id,
  });

  const formatter = GetFormatterForCurrency(userSettings?.currency || 'USD');

  if (!userSettings && !settingsLoading) {
    router.replace('/(auth)/wizard');
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={statsLoading} onRefresh={refetch} />
        }
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.greeting}>
            Hello! 👋
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Income this Month
              </Text>
              <Text variant="headlineSmall" style={[styles.statValue, { color: '#10b981' }]}>
                {formatter.format(stats?.income || 0)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Expenses this Month
              </Text>
              <Text variant="headlineSmall" style={[styles.statValue, { color: '#ef4444' }]}>
                {formatter.format(stats?.expense || 0)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Balance
              </Text>
              <Text variant="headlineSmall" style={[styles.statValue, { color: '#8b5cf6' }]}>
                {formatter.format(stats?.balance || 0)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Savings this Month
              </Text>
              <Text variant="headlineSmall" style={[styles.statValue, { color: '#3b82f6' }]}>
                {formatter.format(stats?.savings || 0)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.statLabel}>
                Total Savings
              </Text>
              <Text variant="headlineSmall" style={[styles.statValue, { color: '#059669' }]}>
                {formatter.format(cumulativeSavings || 0)}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <Portal>
        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? 'close' : 'plus'}
          actions={[
            {
              icon: 'arrow-up',
              label: 'Income',
              onPress: () => router.push('/add-transaction?type=income'),
              color: '#10b981',
            },
            {
              icon: 'arrow-down',
              label: 'Expense',
              onPress: () => router.push('/add-transaction?type=expense'),
              color: '#ef4444',
            },
            {
              icon: 'piggy-bank',
              label: 'Savings',
              onPress: () => router.push('/add-transaction?type=savings'),
              color: '#3b82f6',
            },
            {
              icon: 'chart-line',
              label: 'Investment',
              onPress: () => router.push('/add-investment'),
              color: '#f59e0b',
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
        />
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  greeting: {
    fontWeight: 'bold',
  },
  statsContainer: {
    padding: 16,
    gap: 12,
  },
  statCard: {
    elevation: 2,
  },
  statLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
  },
});
