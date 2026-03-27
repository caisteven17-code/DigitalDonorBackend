import React, { useEffect, useState } from 'react';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import LoginScreen from '@features/auth/screens/LoginScreen';
import SignUpScreen from '@features/auth/screens/SignUpScreen';
import ForgotPasswordScreen from '@features/auth/screens/ForgotPasswordScreen';
import OtpVerifyScreen from '@features/auth/screens/OtpVerifyScreen';
import ResetPasswordScreen from '@features/auth/screens/ResetPasswordScreen';
import EditProfileScreen from '@features/profile/screens/EditProfileScreen';
import { supabase } from '@config/supabase';

import HomeScreen from '@features/home/screens/HomeScreen';
import CartScreen from '@features/cart/screens/CartScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Cart: { cartItems: any[] } | undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OtpVerify: undefined;
  ResetPassword: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'digitaldonor://'],
  config: {
    screens: {
      Login: 'login',
      Home: '',
      Cart: 'cart',
      SignUp: 'signup',
      ForgotPassword: 'forgot-password',
      OtpVerify: 'otp-verify',
      ResetPassword: 'reset-password',
      EditProfile: 'profile/edit',
    },
  },
};

export default function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#A44A3F" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#F6EAD8',
    flex: 1,
    justifyContent: 'center',
  },
});
