import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const commonEmojis = ['💼', '💰', '🏦', '🛒', '🍔', '🚗', '🏠', '💊', '🎮', '📱', '✈️', '🎓', '👕', '⚡', '💡'];

export default function AddCategory() {
  const { type } = useLocalSearchParams<{ type: 'income' | 'expense' | 'savings' }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💼');

  const createCategory = useMutation({
    mutationFn: async () => {
      if (!name) {
        throw new Error('Please enter a category name');
      }

      const { error } = await supabase.from('Category').insert({
        userId: user?.id,
        name,
        icon: selectedEmoji,
        type,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.back();
    },
  });

  const getTitle = () => {
    if (type === 'income') return 'Add Income Category';
    if (type === 'expense') return 'Add Expense Category';
    return 'Add Savings Category';
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
                  label="Category Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  mode="outlined"
                />

                <Text variant="titleMedium" style={styles.emojiLabel}>
                  Select Icon
                </Text>
                <View style={styles.emojiGrid}>
                  {commonEmojis.map((emoji) => (
                    <Button
                      key={emoji}
                      mode={selectedEmoji === emoji ? 'contained' : 'outlined'}
                      onPress={() => setSelectedEmoji(emoji)}
                      style={styles.emojiButton}
                      compact
                    >
                      {emoji}
                    </Button>
                  ))}
                </View>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={() => createCategory.mutate()}
              loading={createCategory.isPending}
              disabled={createCategory.isPending || !name}
              style={styles.submitButton}
            >
              Create Category
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
    marginBottom: 24,
  },
  emojiLabel: {
    marginBottom: 12,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    minWidth: 48,
  },
  submitButton: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 8,
  },
});
