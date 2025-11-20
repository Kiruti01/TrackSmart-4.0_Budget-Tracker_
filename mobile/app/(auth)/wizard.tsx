import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { currencies } from '@/lib/currencies';

export default function Wizard() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);

    const { error } = await supabase.from('UserSettings').insert({
      userId: user.id,
      currency: selectedCurrency,
    });

    setLoading(false);

    if (error) {
      console.error('Error saving settings:', error);
    } else {
      router.replace('/(tabs)/dashboard');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="displaySmall" style={styles.title}>
          Welcome to TrackSmart!
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          Let's set up your account
        </Text>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Select Your Currency
        </Text>

        <View style={styles.currencyGrid}>
          {currencies.map((currency) => (
            <Card
              key={currency.value}
              style={[
                styles.currencyCard,
                selectedCurrency === currency.value && styles.selectedCard,
              ]}
              onPress={() => setSelectedCurrency(currency.value)}
            >
              <Card.Content>
                <Text variant="titleMedium" style={styles.currencyLabel}>
                  {currency.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleComplete}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Get Started
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  currencyGrid: {
    gap: 12,
    marginBottom: 24,
  },
  currencyCard: {
    marginBottom: 8,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  currencyLabel: {
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
});
