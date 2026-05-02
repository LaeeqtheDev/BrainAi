import { Platform } from 'react-native';
import {
 
  createUserWithEmailAndPassword,

  signInWithPopup,

  updateProfile,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { API_BASE_URL } from '../config/api';

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, // ✅ THIS WAS MISSING
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';


// Lazy-load native Google Sign-In ONLY on native platforms
let GoogleSignin, statusCodes;
if (Platform.OS !== 'web') {
  const mod = require('@react-native-google-signin/google-signin');
  GoogleSignin = mod.GoogleSignin;
  statusCodes = mod.statusCodes;
  GoogleSignin.configure({
    webClientId: '846153977846-3t6ju4mbrr9fugsrm1kssr6d2hih2pfe.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    offlineAccess: false,
  });
}

// ─── Email / Password ──────────────────────────────────────────────

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: friendlyAuthError(error) };
  }
};

export const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (name) await updateProfile(user, { displayName: name });

    const idToken = await user.getIdToken();
    try {
      await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email, name }),
      });
    } catch (e) {
      console.warn('Signup sync failed (non-fatal):', e.message);
    }
    return { success: true, user };
  } catch (error) {
    return { success: false, error: friendlyAuthError(error) };
  }
};

// ─── Google Sign-In (Platform-split) ───────────────────────────────

export const signInWithGoogle = async () => {
  if (Platform.OS === 'web') return signInWithGoogleWeb();
  return signInWithGoogleNative();
};

async function signInWithGoogleWeb() {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;
    await syncGoogleUser(firebaseUser);
    return { success: true, user: firebaseUser };
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in cancelled' };
    }
    if (error.code === 'auth/cancelled-popup-request') {
      return { success: false, error: 'Sign-in cancelled' };
    }
    console.error('Google sign-in (web) error:', error);
    return { success: false, error: error.message || 'Google sign-in failed' };
  }
}

async function signInWithGoogleNative() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();
    const idToken = result?.idToken ?? result?.data?.idToken;
    if (!idToken) return { success: false, error: 'No ID token returned from Google' };

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;
    await syncGoogleUser(firebaseUser);
    return { success: true, user: firebaseUser };
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) return { success: false, error: 'Sign-in cancelled' };
    if (error.code === statusCodes.IN_PROGRESS) return { success: false, error: 'Sign-in already in progress' };
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return { success: false, error: 'Google Play Services not available' };
    console.error('Google sign-in (native) error:', error);
    return { success: false, error: error.message || 'Google sign-in failed' };
  }
}

async function syncGoogleUser(firebaseUser) {
  try {
    const idToken = await firebaseUser.getIdToken();
    await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  } catch (e) {
    console.warn('Backend Google sync failed (non-fatal):', e.message);
  }
}

// ─── Sign Out ──────────────────────────────────────────────────────
export const signOut = async () => {
  try {
    // 1. Firebase logout
    await firebaseSignOut(auth);

    // 2. Kill Expo auth browser session (CRITICAL for Google)
    await WebBrowser.dismissBrowser();

    return { success: true };
  } catch (error) {
    console.log('Logout error:', error);
    return { success: false, error: error.message };
  }
};

function friendlyAuthError(error) {
  const map = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-not-found': 'No account with that email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/email-already-in-use': 'An account with that email already exists',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
  };
  return map[error?.code] || error?.message || 'Authentication failed';
}