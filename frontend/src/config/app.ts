import * as ExpoLinking from 'expo-linking';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://192.168.254.108:3000';

export const API_HEADERS = {
  'bypass-tunnel-reminder': 'true',
};

export const APP_SHARE_LINK = ExpoLinking.createURL('/');

export const formatPhp = (amount: number) => `PHP ${Number(amount || 0).toLocaleString()}`;
