import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Menu } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { currencies } from '@/lib/currencies';

export default function AddInvestment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['investment-categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_categories')
        .select('*')
        .or(`user_id.eq.${user?.id},is_system_default.eq.true`)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createInvestment = useMutation({
    mutationFn: async () => {
      if (!selectedCategory || !amount || !name) {
        throw new Error('Please fill all required fields');
      }

      const amountNum = parseFloat(amount);
      const exchangeRate = 1.0;

      const { error } = await supabase.from('investments').insert({
        user_id: user?.id,
        name,
        category_id: selectedCategory.id,
        currency: selectedCurrency,
        initial_amount: amountNum,
        initial_exchange_rate: exchangeRate,
        initial_amount_kes: amountNum * exchangeRate,
        current_amount: amountNum,
        current_exchange_rate: exchangeRate,
        current_value_kes: amountNum * exchangeRate,
        total_invested: amountNum,
        date_invested: new Date().toISOString(),
        notes: notes || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      router.back();
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Add Investment
            </Text>
          </View>

          <View style={styles.content}>
            <Card style={styles.card}>
              <Card.Content>
                <TextInput
                  label="Investment Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  mode="outlined"
                />

                <TextInput
                  label="Amount"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  mode="outlined"
                />

                <Menu
                  visible={currencyMenuVisible}
                  onDismiss={() => setCurrencyMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setCurrencyMenuVisible(true)}
                      style={styles.menuButton}
                    >
                      {selectedCurrency}
                    </Button>
                  }
                >
                  {currencies.map((curr) => (
                    <Menu.Item
                      key={curr.value}
                      onPress={() => {
                        setSelectedCurrency(curr.value);
                        setCurrencyMenuVisible(false);
                      }}
                      title={curr.label}
                    />
                  ))}
                </Menu>

                <Menu
                  visible={categoryMenuVisible}
                  onDismiss={() => setCategoryMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setCategoryMenuVisible(true)}
                      style={styles.menuButton}
                    >
                      {selectedCategory
                        ? `${selectedCategory.icon} ${selectedCategory.name}`
                        : 'Select Category'}
                    </Button>
                  }
                >
                  {categories?.map((cat) => (
                    <Menu.Item
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategory(cat);
                        setCategoryMenuVisible(false);
                      }}
                      title={`${cat.icon} ${cat.name}`}
                    />
                  ))}
                </Menu>

                <TextInput
                  label="Notes (Optional)"
                  value={notes}
                  onChangeText={setNotes}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                />
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={() => createInvestment.mutate()}
              loading={createInvestment.isPending}
              disabled={createInvestment.isPending || !selectedCategory || !amount || !name}
              style={styles.submitButton}
              buttonColor="#f59e0b"
            >
              Add Investment
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
  menuButton: {
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});
