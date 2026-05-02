import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDZm5O8uuDRJcYVIwxeEWupJkWkRADvPLA',
  authDomain: 'mental-health-tracker-584ef.firebaseapp.com',
  projectId: 'mental-health-tracker-584ef',
  storageBucket: 'mental-health-tracker-584ef.appspot.com',
  messagingSenderId: '846153977846',
  appId: '1:846153977846:web:10837ae5a9985a540d81d7',
};

const app = initializeApp(firebaseConfig);

// 🔥 SIMPLE + STABLE
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;