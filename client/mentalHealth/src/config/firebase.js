import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDZm5O8uuDRJcYVIwxeEWupJkWkRADvPLA',
  authDomain: 'mental-health-tracker-584ef.firebaseapp.com',
  projectId: 'mental-health-tracker-584ef',
  storageBucket: 'mental-health-tracker-584ef.firebasestorage.app',
  messagingSenderId: '846153977846',
  appId: '1:846153977846:web:10837ae5a9985a540d81d7',
  measurementId: 'G-K96958NCLW',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;