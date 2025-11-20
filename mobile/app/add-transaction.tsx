import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Menu } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddTransaction() {
  const { type } = useLocalSearchParams<{ type: 'income' | 'expense' | 'savings' }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories', user?.id, type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Category')
        .select('*')
        .eq('userId', user?.id)
        .eq('type', type)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!type,
  });

  const createTransaction = useMutation({
    mutationFn: async () => {
      if (!selectedCategory || !amount || !description) {
        throw new Error('Please fill all fields');
      }

      const { error } = await supabase.from('Transaction').insert({
        userId: user?.id,
        type,
        amount: parseFloat(amount),
        description,
        category: selectedCategory.name,
        categoryIcon: selectedCategory.icon,
        date: new Date().toISOString(),
        originalAmount: parseFloat(amount),
        originalCurrency: 'USD',
      });

      if (error) throw error;

      if (type === 'savings') {
        const { data: existing } = await supabase
          .from('CumulativeSavings')
          .select('*')
          .eq('userId', user?.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('CumulativeSavings')
            .update({
              totalSavings: existing.totalSavings + parseFloat(amount),
              updatedAt: new Date().toISOString(),
            })
            .eq('userId', user?.id);
        } else {
          await supabase.from('CumulativeSavings').insert({
            userId: user?.id,
            totalSavings: parseFloat(amount),
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cumulative-savings'] });
      router.back();
    },
  });

  const getTitle = () => {
    if (type === 'income') return 'Add Income';
    if (type === 'expense') return 'Add Expense';
    return 'Add Savings';
  };

  const getColor = () => {
    if (type === 'income') return '#10b981';
    if (type === 'expense') return '#ef4444';
    return '#3b82f6';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              {getTitle()}
            </Text>
          </View>

          <View style={styles.content}>
            <Card style={styles.card}>
              <Card.Content>
                <TextInput
                  label="Amount"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  mode="outlined"
                />

                <TextInput
                  label="Description"
                  value={description}
                  onChangeText={setDescription}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                />

                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setMenuVisible(true)}
                      style={styles.categoryButton}
                    >
                      {selectedCategory
                        ? `${selectedCategory.icon} ${selectedCategory.name}`
                        : 'Select Category'}
                    </Button>
                  }
                >
                  {categories?.map((cat) => (
                    <Menu.Item
                      key={cat.name}
                      onPress={() => {
                        setSelectedCategory(cat);
                        setMenuVisible(false);
                      }}
                      title={`${cat.icon} ${cat.name}`}
                    />
                  ))}
                </Menu>

                {categories?.length === 0 && (
                  <Text style={styles.hint}>
                    No categories found. Create one in the Manage tab first.
                  </Text>
                )}
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={() => createTransaction.mutate()}
              loading={createTransaction.isPending}
              disabled={createTransaction.isPending || !selectedCategory || !amount || !description}
              style={styles.submitButton}
              buttonColor={getColor()}
            >
              Add {type}
            </Button>

            <Button mode="text" onPress={() => router.back()} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  content: {
    padding: 16,
  },
  card: {
    elevation: 2,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  categoryButton: {
    marginTop: 8,
  },
  hint: {
    marginTop: 8,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  submitButton: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});
