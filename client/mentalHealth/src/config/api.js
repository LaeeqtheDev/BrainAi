import { auth } from './firebase';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDevHost = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:5000`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  return 'http://localhost:5000';
};

export const API_BASE_URL = getDevHost();

export const getAuthHeaders = async () => {
  const user = auth.currentUser;
  const headers = { 'Content-Type': 'application/json' };
  if (user) {
    const token = await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};