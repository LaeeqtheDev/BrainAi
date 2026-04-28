import React, { useCallback, useState, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts, Fraunces_400Regular_Italic, Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  DMSans_400Regular, DMSans_500Medium, DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

import { AuthProvider } from './src/context/AuthContext';
import { LockProvider } from './src/context/LockContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashAnimation from './src/components/SplashAnimation';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular_Italic, Fraunces_600SemiBold,
    DMSans_400Regular, DMSans_500Medium, DMSans_700Bold,
  });
  const [splashDone, setSplashDone] = useState(false);

  // Hide the native splash as soon as the JS bundle is ready,
  // so our animated splash takes over visually.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Show animated splash until BOTH fonts are loaded AND animation finished
  if (!splashDone || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <SplashAnimation onDone={() => setSplashDone(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <AuthProvider>
          <LockProvider>
            <AppNavigator />
          </LockProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}