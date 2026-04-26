import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/main/HomeScreen';
import MoodTrackerScreen from '../screens/main/MoodTrackerScreen';
import JournalScreen from '../screens/main/JournalScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

import { Colors, Fonts, FontSizes } from '../config/theme';

const Tab = createBottomTabNavigator();

const iconMap = {
  Home: ['leaf-outline', 'leaf'],
  Mood: ['heart-circle-outline', 'heart-circle'],
  Journal: ['book-outline', 'book'],
  Profile: ['person-circle-outline', 'person-circle'],
  Settings: ['settings-outline', 'settings'],
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.bodyMedium,
          fontSize: FontSizes.xs,
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [outline, filled] = iconMap[route.name] || ['ellipse-outline', 'ellipse'];
          return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Mood" component={MoodTrackerScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}