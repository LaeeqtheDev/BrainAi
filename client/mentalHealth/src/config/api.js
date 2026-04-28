import { auth } from './firebase';
import { Platform } from 'react-native';

// 🔥 HARD STABLE DEV IP (your machine)
const LOCAL_IP = '192.168.18.4';

export const API_BASE_URL =
  Platform.OS === 'android'
    ? `http://${LOCAL_IP}:5000`
    : `http://${LOCAL_IP}:5000`;

export const getAuthHeaders = async () => {
  const user = auth.currentUser;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (user) {
    const token = await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};