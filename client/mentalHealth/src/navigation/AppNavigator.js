import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useLock } from '../context/LockContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import LockScreen from '../components/Locksceen';

import ChatbotScreen from '../screens/main/ChatbotScreen';
import BreathingScreen from '../screens/main/BreathingScreen';
import QuranicHealingScreen from '../screens/main/QuranicHealingScreen';

import EditProfileScreen from '../screens/main/EditProfileScreen';
import RemindersScreen from '../screens/main/RemindersScreen';
import PrivacySettingsScreen from '../screens/main/PrivacySettingsScreen';
import PrivacyPolicyScreen from '../screens/main/PrivacyPolicyScreen';
import LanguageScreen from '../screens/main/LanguageScreen';
import HelpSupportScreen from '../screens/main/HelpSupportScreen';
import FeedbackFormScreen from '../screens/main/FeedbackFormScreen';
import DataStorageScreen from '../screens/main/DataStorageScreen';

import { Colors } from '../config/theme';

const Stack = createNativeStackNavigator();
const NavTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: Colors.background } };

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Feature stack */}
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen name="QuranicHealing" component={QuranicHealingScreen} />

      {/* Profile/Settings sub-screens */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="FeedbackForm" component={FeedbackFormScreen} />
      <Stack.Screen name="DataStorage" component={DataStorageScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, initializing } = useAuth();
  const { locked } = useLock();

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If signed in AND locked, show lock screen on top of everything
  if (user && locked) return <LockScreen />;

  return (
    <NavigationContainer theme={NavTheme}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
});