import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@config/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      Alert.alert('Missing credentials', 'Enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        Alert.alert('Login failed', error.message);
      }
    } catch {
      Alert.alert('Login failed', 'Unable to connect to Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Digital Donor</Text>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Use your Supabase email and password to continue.</Text>

          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#8C7B7B"
              style={styles.input}
              value={email}
            />
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#8C7B7B"
              secureTextEntry
              style={styles.input}
              value={password}
            />

            <Pressable
              disabled={isSubmitting}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSubmitting) && styles.primaryButtonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF7ED" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          <Pressable onPress={() => navigation.navigate('SignUp')} style={styles.secondaryAction}>
            <Text style={styles.secondaryText}>Create an account</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6EAD8' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  panel: {
    backgroundColor: '#FFF9F0',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#5C4033',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 6,
  },
  eyebrow: {
    color: '#A44A3F',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: { color: '#4A2C24', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#6B5A57', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  form: { gap: 14 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2D4C8',
    borderRadius: 14,
    borderWidth: 1,
    color: '#33211D',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#A44A3F',
    borderRadius: 14,
    marginTop: 6,
    minHeight: 54,
    justifyContent: 'center',
  },
  primaryButtonPressed: { opacity: 0.88 },
  primaryButtonText: { color: '#FFF7ED', fontSize: 16, fontWeight: '700' },
  secondaryAction: { alignItems: 'center', marginTop: 20 },
  secondaryText: { color: '#7A3831', fontSize: 15, fontWeight: '600' },
});
