import { auth } from './firebase';
import { Platform } from 'react-native';

// 🔥 DEPLOYMENT MODE - Change this to switch environments
const USE_PRODUCTION = true; // Set to false for local testing

// 🌐 PRODUCTION URL
const PRODUCTION_URL = 'https://brainai-i7re.onrender.com';

// 🏠 LOCAL DEVELOPMENT - Multiple Network IPs
const NETWORK_IPS = {
  HOME: '192.168.18.4',
  MCDONALDS: '172.20.10.3',
  PIXEL: '10.52.207.205',
};

const CURRENT_NETWORK = 'PIXEL'; // Change when switching networks

// 🎯 Select API URL based on mode
export const API_BASE_URL = USE_PRODUCTION
  ? PRODUCTION_URL
  : `http://${NETWORK_IPS[CURRENT_NETWORK]}:5000`;

export const getAuthHeaders = async () => {
  const user = auth.currentUser;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (user) {
    try {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
  }

  return headers;
};

// 🔍 Debug helper
console.log(' API Base URL:', API_BASE_URL);
console.log(' Mode:', USE_PRODUCTION ? 'PRODUCTION' : 'LOCAL DEVELOPMENT');