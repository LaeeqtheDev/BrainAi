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

  const appState = useRef(AppState.currentState);
  const unlockInProgress = useRef(false);

  // Load lock state
  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(KEY);
      if (v === '1') {
        setLockEnabled(true);
        setLocked(true);
      }
    })();
  }, []);

  // App background/foreground handler
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const wasActive = appState.current === 'active';
      const isLeaving = next === 'inactive' || next === 'background';

      // Prevent interference during biometric flow
      if (unlockInProgress.current) {
        appState.current = next;
        return;
      }

      if (wasActive && isLeaving && lockEnabled) {
        setLocked(true);
      }

      appState.current = next;
    });

    return () => sub.remove();
  }, [lockEnabled]);

  // Enable lock
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

  // Disable lock
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

  // Unlock flow (FIXED)
  const unlock = async () => {
    if (unlocking || unlockInProgress.current) return;

    setUnlocking(true);
    unlockInProgress.current = true;

    try {
      const ok = await authenticate('Unlock App');

      if (ok) {
        setLocked(false);
      }
    } catch (err) {
      console.log('Unlock error:', err);
    } finally {
      setUnlocking(false);

      // small delay prevents AppState re-lock race
      setTimeout(() => {
        unlockInProgress.current = false;
      }, 300);
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