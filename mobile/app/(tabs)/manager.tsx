import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, List } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function Manager() {
  const { user } = useAuth();

  const { data: userSettings } = useQuery({
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

  const { data: categories } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Category')
        .select('*')
        .eq('userId', user?.id)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const incomeCategories = categories?.filter((c) => c.type === 'income') || [];
  const expenseCategories = categories?.filter((c) => c.type === 'expense') || [];
  const savingsCategories = categories?.filter((c) => c.type === 'savings') || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Manage
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Manage your account settings and categories
          </Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Title title="Currency" />
            <Card.Content>
              <Text variant="titleLarge">{userSettings?.currency || 'USD'}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title
              title="Income Categories"
              right={(props) => (
                <Button onPress={() => router.push('/add-category?type=income')}>
                  Add
                </Button>
              )}
            />
            <Card.Content>
              {incomeCategories.length === 0 ? (
                <Text style={styles.emptyText}>No categories yet</Text>
              ) : (
                incomeCategories.map((cat) => (
                  <List.Item
                    key={cat.name}
                    title={cat.name}
                    left={() => <Text style={styles.emoji}>{cat.icon}</Text>}
                  />
                ))
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title
              title="Expense Categories"
              right={(props) => (
                <Button onPress={() => router.push('/add-category?type=expense')}>
                  Add
                </Button>
              )}
            />
            <Card.Content>
              {expenseCategories.length === 0 ? (
                <Text style={styles.emptyText}>No categories yet</Text>
              ) : (
                expenseCategories.map((cat) => (
                  <List.Item
                    key={cat.name}
                    title={cat.name}
                    left={() => <Text style={styles.emoji}>{cat.icon}</Text>}
                  />
                ))
              )}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title
              title="Savings Categories"
              right={(props) => (
                <Button onPress={() => router.push('/add-category?type=savings')}>
                  Add
                </Button>
              )}
            />
            <Card.Content>
              {savingsCategories.length === 0 ? (
                <Text style={styles.emptyText}>No categories yet</Text>
              ) : (
                savingsCategories.map((cat) => (
                  <List.Item
                    key={cat.name}
                    title={cat.name}
                    left={() => <Text style={styles.emoji}>{cat.icon}</Text>}
                  />
                ))
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
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
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    elevation: 2,
  },
  emptyText: {
    opacity: 0.5,
    fontStyle: 'italic',
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
});
