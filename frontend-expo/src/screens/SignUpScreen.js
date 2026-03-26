import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomInput from '../components/CustomInput';
import ImageCarousel from '../components/ImageCarousel';
import StepTabs from '../components/StepTabs';

export default function SignUpScreen({ navigation }) {
  const [currentTab, setCurrentTab] = useState(1);
  const [frontId, setFrontId] = useState(null);
  const [backId, setBackId] = useState(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Image picker failed');
      return;
    }

    const asset = result.assets?.[0];
    if (!asset) return;

    if (currentTab === 1) {
      setFrontId(asset);
      Alert.alert('Success', 'Front Page ID Selected!');
    } else {
      setBackId(asset);
      Alert.alert('Success', 'Back Page ID Selected!');
    }
  };

  const handleFinish = () => {
    if (!username || !email || !phone || !password) {
      Alert.alert('Error', 'Please complete all fields');
      return;
    }

    if (!frontId || !backId) {
      Alert.alert('Error', 'Please upload both front and back ID images');
      return;
    }

    Alert.alert('Success', 'Registration Submitted!');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ImageCarousel />

      <View style={styles.content}>
        <Text style={styles.title}>Sign Up</Text>

        <CustomInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
        />

        <CustomInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
        />

        <CustomInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone Number"
          keyboardType="phone-pad"
        />

        <CustomInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />

        <StepTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          <Text style={styles.uploadText}>
            {currentTab === 1 ? 'Upload Front ID' : 'Upload Back ID'}
          </Text>
        </TouchableOpacity>

        {frontId?.uri ? (
          <Image source={{ uri: frontId.uri }} style={styles.preview} />
        ) : null}

        {backId?.uri ? (
          <Image source={{ uri: backId.uri }} style={styles.preview} />
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleFinish}>
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.link}>Login</Text>
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
    fontSize: 30,
    fontWeight: '700',
    color: '#B94F4F',
    marginBottom: 20,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B94F4F',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    color: '#B94F4F',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#B94F4F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  loginText: {
    textAlign: 'center',
    color: '#444',
  },
  link: {
    color: '#B94F4F',
    fontWeight: '700',
  },
});
