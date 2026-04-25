import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

// Import icon components
import { HomeIcon, MoodIcon, JournalIcon, SettingsIcon } from '../components/TabIcons';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import MoodTrackerScreen from '../screens/main/MoodTrackerScreen';
import JournalScreen from '../screens/main/JournalScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#00ACC1',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <HomeIcon color={color} size={24} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="MoodTab" 
        component={MoodTrackerScreen}
        options={{
          tabBarLabel: 'Mood',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <MoodIcon color={color} size={24} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="JournalTab" 
        component={JournalScreen}
        options={{
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <JournalIcon color={color} size={24} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <SettingsIcon color={color} size={24} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
});