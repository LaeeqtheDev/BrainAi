import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  signInWithCustomToken,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiPost } from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const signUp = async (email, password, fullName) => {
  try {
    // 1) Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: fullName });

    // 2) Backend creates user doc with default settings
    try {
      await apiPost('/api/auth/signup', { email: email.trim(), password, name: fullName });
    } catch (e) {
      // Backend may say "already exists" if Firebase Admin already created it; ignore
      console.log('Backend signup note:', e.message);
    }

    return { success: true, user: cred.user };
  } catch (e) {
    return { success: false, error: friendlyError(e) };
  }
};

export const signIn = async (email, password) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return { success: true, user: cred.user };
  } catch (e) {
    return { success: false, error: friendlyError(e) };
  }
};

// 🔥 NEW: Google Sign-In via Backend
export const signInWithGoogle = async (idToken) => {
  try {
    console.log('📤 Sending Google token to backend...');
    
    // Send ID token to backend for verification
    const response = await apiPost('/api/auth/google', { idToken });
    console.log('✅ Backend response:', response);

    // Backend returns custom token and user data
    const { customToken, user } = response;

    // Sign in to Firebase with custom token
    console.log('🔐 Signing in with custom token...');
    await signInWithCustomToken(auth, customToken);
    
    // Store custom token
    await AsyncStorage.setItem('userToken', customToken);

    console.log('✅ Google sign-in successful:', user.email);

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    return {
      success: false,
      error: error.message || 'Google sign-in failed',
    };
  }
};

export const signOut = async () => {
  try { 
    await firebaseSignOut(auth); 
    await AsyncStorage.removeItem('userToken');
    return { success: true }; 
  }
  catch (e) { return { success: false, error: e.message }; }
};

const friendlyError = (e) => {
  const code = e?.code || '';
  if (code.includes('email-already-in-use')) return 'That email is already registered.';
  if (code.includes('invalid-email')) return 'That email looks invalid.';
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if (code.includes('user-not-found')) return 'No account with that email.';
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Email or password is incorrect.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Try again in a moment.';
  return e.message || 'Something went wrong.';
};