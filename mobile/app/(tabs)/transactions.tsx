import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, Searchbar } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GetFormatterForCurrency } from '@/lib/currencies';
import { formatDate } from '@/lib/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Transaction } from '@/lib/types';

export default function Transactions() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'savings'>('all');

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

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['transactions', user?.id, filter],
    queryFn: async () => {
      let query = supabase
        .from('Transaction')
        .select('*')
        .eq('userId', user?.id)
        .order('date', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user?.id,
  });

  const formatter = GetFormatterForCurrency(userSettings?.currency || 'USD');

  const filteredTransactions = transactions?.filter((t) =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const color =
      item.type === 'income'
        ? '#10b981'
        : item.type === 'expense'
        ? '#ef4444'
        : '#3b82f6';

    return (
      <Card style={styles.transactionCard}>
        <Card.Content>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionInfo}>
              <Text variant="titleMedium">{item.categoryIcon} {item.category}</Text>
              <Text variant="bodySmall" style={styles.description}>
                {item.description}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {formatDate(new Date(item.date))}
              </Text>
            </View>
            <Text variant="titleLarge" style={[styles.amount, { color }]}>
              {item.type === 'income' ? '+' : '-'}
              {formatter.format(item.amount)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Transactions
        </Text>

        <Searchbar
          placeholder="Search transactions"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <View style={styles.filters}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.chip}
          >
            All
          </Chip>
          <Chip
            selected={filter === 'income'}
            onPress={() => setFilter('income')}
            style={styles.chip}
          >
            Income
          </Chip>
          <Chip
            selected={filter === 'expense'}
            onPress={() => setFilter('expense')}
            style={styles.chip}
          >
            Expense
          </Chip>
          <Chip
            selected={filter === 'savings'}
            onPress={() => setFilter('savings')}
            style={styles.chip}
          >
            Savings
          </Chip>
        </View>
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge">No transactions found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    gap: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  searchbar: {
    elevation: 0,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    marginBottom: 4,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  transactionCard: {
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  description: {
    opacity: 0.7,
    marginTop: 4,
  },
  date: {
    opacity: 0.5,
    marginTop: 2,
  },
  amount: {
    fontWeight: 'bold',
    marginLeft: 16,
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
});
