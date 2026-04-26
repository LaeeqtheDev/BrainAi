import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiPost } from './apiService';

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

export const signOut = async () => {
  try { await firebaseSignOut(auth); return { success: true }; }
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