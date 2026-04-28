import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticate, isBiometricAvailable } from '../services/biometricService';

const KEY = 'appLock.enabled';
const LockContext = createContext({ locked: false, lockEnabled: false });

export const LockProvider = ({ children }) => {
  const [lockEnabled, setLockEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(KEY);
      if (v === '1') {
        setLockEnabled(true);
        setLocked(true);
      }
    })();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current === 'active' && next.match(/inactive|background/)) {
        if (lockEnabled) setLocked(true);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [lockEnabled]);

  const enableLock = async () => {
    const available = await isBiometricAvailable();
    if (!available) return { success: false, error: 'Biometrics not set up on this device.' };
    const ok = await authenticate('Enable App Lock');
    if (!ok) return { success: false, error: 'Authentication failed' };
    await AsyncStorage.setItem(KEY, '1');
    setLockEnabled(true);
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
    if (unlocking) return;
    setUnlocking(true);
    const ok = await authenticate('Unlock Stillwater');
    if (ok) setLocked(false);
    setUnlocking(false);
  };

  return (
    <LockContext.Provider value={{ locked, lockEnabled, unlock, enableLock, disableLock, unlocking }}>
      {children}
    </LockContext.Provider>
  );
};

export const useLock = () => useContext(LockContext);