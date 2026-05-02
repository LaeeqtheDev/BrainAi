import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticate, isBiometricAvailable } from '../services/biometricService';

const KEY = 'appLock.enabled';

const LockContext = createContext({
  locked: false,
  lockEnabled: false,
  unlocking: false,
  unlock: async () => {},
  enableLock: async () => {},
  disableLock: async () => {},
});

export const LockProvider = ({ children }) => {
  const [lockEnabled, setLockEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // 🔥 HARD GUARDS (prevent race conditions)
  const appState = useRef(AppState.currentState);
  const biometricActive = useRef(false);
  const lockStateRef = useRef(false);

  // sync ref with state
  useEffect(() => {
    lockStateRef.current = locked;
  }, [locked]);

  // load saved lock state
  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(KEY);
      if (v === '1') {
        setLockEnabled(true);
        setLocked(true);
      }
    })();
  }, []);

  // =========================
  // APP STATE HANDLER (FIXED)
  // =========================
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const wasActive = appState.current === 'active';
      const isLeaving = nextState === 'inactive' || nextState === 'background';

      // 🚨 BLOCK EVERYTHING DURING BIOMETRIC FLOW
      if (biometricActive.current) {
        appState.current = nextState;
        return;
      }

      // only lock on real background transition
      if (wasActive && isLeaving && lockEnabled) {
        setLocked(true);
      }

      appState.current = nextState;
    });

    return () => sub.remove();
  }, [lockEnabled]);

  // =========================
  // ENABLE LOCK
  // =========================
  const enableLock = async () => {
    const available = await isBiometricAvailable();
    if (!available) {
      return { success: false, error: 'Biometrics not available' };
    }

    const ok = await authenticate('Enable App Lock');
    if (!ok) {
      return { success: false, error: 'Authentication failed' };
    }

    await AsyncStorage.setItem(KEY, '1');
    setLockEnabled(true);
    setLocked(true);

    return { success: true };
  };

  // =========================
  // DISABLE LOCK
  // =========================
  const disableLock = async () => {
    const ok = await authenticate('Disable App Lock');
    if (!ok) {
      return { success: false, error: 'Authentication failed' };
    }

    await AsyncStorage.removeItem(KEY);
    setLockEnabled(false);
    setLocked(false);

    return { success: true };
  };

  // =========================
  // UNLOCK (FULLY ATOMIC)
  // =========================
  const unlock = async () => {
    // 🚨 HARD BLOCK re-entry
    if (unlocking || biometricActive.current) return;

    setUnlocking(true);
    biometricActive.current = true;

    try {
      const ok = await authenticate('Unlock App');

      if (ok) {
        setLocked(false);
      }
    } catch (e) {
      console.log('Unlock error:', e);
    } finally {
      setUnlocking(false);

      // 🔥 CRITICAL: delay prevents iOS/Android gesture race
      setTimeout(() => {
        biometricActive.current = false;
      }, 900);
    }
  };

  return (
    <LockContext.Provider
      value={{
        locked,
        lockEnabled,
        unlocking,
        unlock,
        enableLock,
        disableLock,
      }}
    >
      {children}
    </LockContext.Provider>
  );
};

export const useLock = () => useContext(LockContext);