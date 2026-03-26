import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import ImageCarousel from '../components/ImageCarousel';

export default function ForgotPasswordScreen({ navigation }) {
  const [input, setInput] = useState('');

  const handleContinue = () => {
    const trimmed = input.trim();

    if (!trimmed) {
      Alert.alert('Error', 'Please enter your email or phone number');
      return;
    }

    const isPhone = /^[+]?[0-9\s-]{7,15}$/.test(trimmed);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!isPhone && !isEmail) {
      Alert.alert(
        'Error',
        'Please enter a valid email address or phone number',
      );
      return;
    }

    navigation.navigate('OtpVerify');
  };

  return (
    <ScrollView style={styles.container}>
      <ImageCarousel />

      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password</Text>

        <CustomInput
          value={input}
          onChangeText={setInput}
          placeholder="Email or Phone Number"
          keyboardType={
            input && /^\d/.test(input) ? 'phone-pad' : 'email-address'
          }
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signupText}>
            No account yet? <Text style={styles.link}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#B94F4F',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#B94F4F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  signupText: {
    textAlign: 'center',
    color: '#444',
  },
  link: {
    color: '#B94F4F',
    fontWeight: '700',
  },
});
