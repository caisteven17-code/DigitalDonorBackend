import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const handleUpdate = () => {
    Alert.alert('Success', 'Profile Updated Successfully');
  };

  const handlePickProfile = async () => {
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
    if (asset) {
      setProfileImage(asset);
      Alert.alert('Success', 'Profile picture selected');
    }
  };

  const formatDate = date => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Profile</Text>

        <CustomInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full Name"
        />

        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(dob)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDob(selectedDate);
            }}
          />
        )}

        <CustomInput
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
        />

        <CustomInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone Number"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handlePickProfile}
        >
          <Text style={styles.secondaryButtonText}>Change Profile Picture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update</Text>
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
  dateBox: {
    borderWidth: 1,
    borderColor: '#E6D7D7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 14,
  },
  dateText: {
    color: '#333',
  },
  button: {
    backgroundColor: '#B94F4F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#B94F4F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: '#B94F4F',
    fontWeight: '700',
  },
});
