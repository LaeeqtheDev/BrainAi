import { auth } from './firebase';
import { Platform } from 'react-native';

// 🔥 MULTIPLE NETWORK SUPPORT
const NETWORK_IPS = {
  HOME: '192.168.18.4',      // Home WiFi
  MCDONALDS: '172.20.10.3', 
  pixel: '10.52.207.205' // McDonald's WiFi
  // Add more as needed
};

// 👇 CHANGE THIS WHEN YOU SWITCH NETWORKS!
const CURRENT_NETWORK = 'pixel'; // ← Change to 'HOME' when at home

const LOCAL_IP = NETWORK_IPS[CURRENT_NETWORK];

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

// 🔍 Debug helper
console.log(`🌐 API URL: ${API_BASE_URL}`);