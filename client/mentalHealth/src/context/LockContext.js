import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticate, isBiometricAvailable } from '../services/biometricService';

const KEY = 'appLock.enabled';
const LockContext = createContext();

export const LockProvider = ({ children }) => {
  const [lockEnabled, setLockEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const appState = useRef(AppState.currentState);
  const unlockInProgress = useRef(false);
  const lastStateChange = useRef(Date.now());

  // Load saved state
  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(KEY);
      if (v === '1') {
        setLockEnabled(true);
      }
    })();
  }, []);

  // App state handler (FIXED debounce + stability)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const now = Date.now();
      const delta = now - lastStateChange.current;

      // debounce rapid switching (< 400ms)
      if (delta < 400) {
        appState.current = nextState;
        return;
      }

      const previous = appState.current;
      appState.current = nextState;
      lastStateChange.current = now;

      if (previous === 'active' && nextState.match(/inactive|background/)) {
        if (lockEnabled) {
          setLocked(true);
          unlockInProgress.current = false; // reset any stuck unlock
        }
      }
    });

    return () => sub.remove();
  }, [lockEnabled]);

  const enableLock = async () => {
    const available = await isBiometricAvailable();
    if (!available) {
      return { success: false, error: 'Biometrics not available' };
    }

    const ok = await authenticate('Enable App Lock');
    if (!ok) return { success: false, error: 'Authentication failed' };

    await AsyncStorage.setItem(KEY, '1');
    setLockEnabled(true);
    setLocked(true);

    return { success: true };
  };

  const disableLock = async () => {
    const ok = await authenticate('Disable App Lock');
    if (!ok) return { success: false, error: 'Authentication failed' };

    await AsyncStorage.removeItem(KEY);
    setLockEnabled(false);
    setLocked(false);

    return { success: true };
  };

  const unlock = async () => {
    // HARD GUARD: prevents multiple biometric calls
    if (unlockInProgress.current || unlocking) return;

    unlockInProgress.current = true;
    setUnlocking(true);

    try {
      const ok = await authenticate('Unlock App');

      if (ok) {
        setLocked(false);
      }
    } finally {
      setUnlocking(false);

      // small delay prevents instant re-lock glitch
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
        enableLock,
        disableLock,
        unlock,
      }}
    >
      {children}
    </LockContext.Provider>
  );
};

export const useLock = () => useContext(LockContext);