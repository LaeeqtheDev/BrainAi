import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/colors';

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [moodReminders, setMoodReminders] = useState(true);
  const [appLockEnabled, setAppLockEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // TODO: Clear session, navigate to login
            Alert.alert('Logged Out', 'You have been logged out successfully');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted');
          }
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        { 
          icon: '👤', 
          label: 'Edit Profile', 
          onPress: () => Alert.alert('Edit Profile', 'Coming soon!'),
          type: 'navigate'
        },
        { 
          icon: '🔐', 
          label: 'Change Password', 
          onPress: () => Alert.alert('Change Password', 'Coming soon!'),
          type: 'navigate'
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { 
          icon: '🔔', 
          label: 'Push Notifications', 
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
          type: 'toggle'
        },
        { 
          icon: '📊', 
          label: 'Mood Reminders', 
          value: moodReminders,
          onToggle: setMoodReminders,
          type: 'toggle'
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        { 
          icon: '🔒', 
          label: 'App Lock (Biometric)', 
          value: appLockEnabled,
          onToggle: setAppLockEnabled,
          type: 'toggle'
        },
        { 
          icon: '📄', 
          label: 'Privacy Policy', 
          onPress: () => Alert.alert('Privacy Policy', 'Coming soon!'),
          type: 'navigate'
        },
        { 
          icon: '📜', 
          label: 'Terms of Service', 
          onPress: () => Alert.alert('Terms of Service', 'Coming soon!'),
          type: 'navigate'
        },
      ],
    },
    {
      title: 'Data',
      items: [
        { 
          icon: '📥', 
          label: 'Export My Data', 
          onPress: () => Alert.alert('Export Data', 'Your data will be sent to your email'),
          type: 'navigate'
        },
        { 
          icon: '🗑️', 
          label: 'Clear All Data', 
          onPress: () => Alert.alert('Clear Data', 'All local data will be cleared'),
          type: 'navigate',
          danger: true
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { 
          icon: '❓', 
          label: 'Help & Support', 
          onPress: () => Alert.alert('Help', 'Contact: support@mentalhealth.com'),
          type: 'navigate'
        },
        { 
          icon: '⭐', 
          label: 'Rate App', 
          onPress: () => Alert.alert('Rate Us', 'Thank you for your support!'),
          type: 'navigate'
        },
        { 
          icon: '📧', 
          label: 'Send Feedback', 
          onPress: () => Alert.alert('Feedback', 'Coming soon!'),
          type: 'navigate'
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
      
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>U</Text>
          </View>
          <Text style={styles.profileName}>User Name</Text>
          <Text style={styles.profileEmail}>user@example.com</Text>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItems}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.settingItemLast
                  ]}
                  onPress={item.type === 'navigate' ? item.onPress : null}
                  activeOpacity={item.type === 'navigate' ? 0.7 : 1}
                >
                  <View style={styles.settingItemLeft}>
                    <Text style={styles.settingIcon}>{item.icon}</Text>
                    <Text style={[
                      styles.settingLabel,
                      item.danger && styles.settingLabelDanger
                    ]}>
                      {item.label}
                    </Text>
                  </View>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#d1d5db', true: '#4a6741' }}
                      thumbColor={Colors.white}
                    />
                  ) : (
                    <Text style={styles.settingArrow}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 4,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a6741',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  profileName: {
    fontSize: FontSizes.xlarge,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: FontSizes.medium,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionItems: {
    backgroundColor: Colors.white,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
    width: 24,
  },
  settingLabel: {
    fontSize: FontSizes.medium,
    color: Colors.textPrimary,
  },
  settingLabelDanger: {
    color: '#ef5350',
  },
  settingArrow: {
    fontSize: 24,
    color: Colors.textLight,
  },
  logoutButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a6741',
  },
  logoutButtonText: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: '#4a6741',
  },
  deleteButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: FontSizes.small,
    color: '#ef5350',
  },
  versionText: {
    fontSize: FontSizes.small,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});