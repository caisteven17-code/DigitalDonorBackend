import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OtpVerifyScreen() {
  return (
    <View style={styles.container}>
      <Text>OTP Verify (TS)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
