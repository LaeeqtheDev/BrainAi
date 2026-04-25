import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main Screens
import ChatbotScreen from '../screens/main/ChatbotScreen';
import BreathingScreen from '../screens/toolkit/BreathingScreen';
import QuranScreen from '../screens/toolkit/QuranScreen';

// Tab Navigator
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Tabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        
        {/* Main App - Tab Navigator */}
        <Stack.Screen name="Tabs" component={TabNavigator} />
        
        {/* Modal/Overlay Screens (not in tabs) */}
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="Breathing" component={BreathingScreen} />
        <Stack.Screen name="Quran" component={QuranScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}