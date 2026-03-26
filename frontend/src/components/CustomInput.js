import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function CustomInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#E6D7D7',
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  focused: {
    borderColor: '#B94F4F',
  },
  input: {
    height: 50,
    color: '#000',
  },
});
