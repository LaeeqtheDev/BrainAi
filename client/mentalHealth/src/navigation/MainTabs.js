import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  // Bottom inset: respect device safe area, with a sensible minimum
  const bottomPad = Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPad; // 56dp content + safe area

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
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: bottomPad,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.bodyMedium,
          fontSize: FontSizes.xs,
          letterSpacing: 0.4,
          marginTop: 2,
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