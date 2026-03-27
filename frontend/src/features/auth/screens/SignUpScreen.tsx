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

export default function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirmPassword) {
      Alert.alert('Missing details', 'Complete all fields before creating an account.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Your passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }

      Alert.alert(
        'Account created',
        'Your Supabase account was created. If email confirmation is enabled, verify your inbox before logging in.',
      );
      navigation.goBack();
    } catch {
      Alert.alert('Sign up failed', 'Unable to connect to Supabase.');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register with the same Supabase credentials used for login.</Text>

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
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor="#8C7B7B"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
            />

            <Pressable
              disabled={isSubmitting}
              onPress={handleSignUp}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSubmitting) && styles.primaryButtonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF7ED" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              )}
            </Pressable>
          </View>

          <Pressable onPress={() => navigation.goBack()} style={styles.secondaryAction}>
            <Text style={styles.secondaryText}>Back to login</Text>
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
