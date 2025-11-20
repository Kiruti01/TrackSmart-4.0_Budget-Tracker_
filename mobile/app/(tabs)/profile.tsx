import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, List, Divider } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function Profile() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Profile
          </Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.label}>
                Email
              </Text>
              <Text variant="titleMedium">{user?.email}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <List.Item
              title="About TrackSmart"
              description="Version 1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield-check" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </Card>

          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.signOutButton}
            buttonColor="#ef4444"
          >
            Sign Out
          </Button>

          <Text variant="bodySmall" style={styles.copyright}>
            © {new Date().getFullYear()} Kiruti Tech™
          </Text>
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
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    elevation: 2,
  },
  label: {
    opacity: 0.7,
    marginBottom: 4,
  },
  signOutButton: {
    marginTop: 24,
    paddingVertical: 6,
  },
  copyright: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 24,
  },
});
