import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { signOut } from '../../services/authService';
import {
  getMe, updateNotifications, updatePrivacy, updateSecurity,
} from '../../services/settingsService';
import { syncAllReminders, requestPermissions } from '../../services/notificationService';
import { useLock } from '../../context/LockContext';
import { isBiometricAvailable, getBiometricType } from '../../services/biometricService';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { lockEnabled, enableLock, disableLock } = useLock();

  const [prefs, setPrefs] = useState({
    dailyReminders: true, breathingReminders: true, weeklyInsights: false,
  });
  const [privacy, setPrivacy] = useState({ analytics: true });
  const [language, setLanguage] = useState('English');
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');

  const load = useCallback(async () => {
    const me = await getMe();
    if (me?.settings?.notifications) setPrefs(me.settings.notifications);
    if (me?.settings?.privacy) setPrivacy(me.settings.privacy);
    if (me?.settings?.general?.language) setLanguage(me.settings.general.language);
    setBiometricLabel(await getBiometricType());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggleReminder = async (key, value) => {
    if (value) {
      const granted = await requestPermissions();
      if (!granted) return Alert.alert('Notifications off', 'Enable notifications in your device settings to use reminders.');
    }
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await updateNotifications(next);
    await syncAllReminders(next);
  };

  const toggleAnalytics = async (value) => {
    const next = { ...privacy, analytics: value };
    setPrivacy(next);
    await updatePrivacy(next);
  };

  const toggleAppLock = async (value) => {
    if (value) {
      const available = await isBiometricAvailable();
      if (!available) {
        return Alert.alert(
          'Not available',
          'Set up Face ID, Touch ID, or fingerprint in your device settings first.'
        );
      }
      const r = await enableLock();
      if (!r.success) return Alert.alert('Could not enable', r.error);
      await updateSecurity({ appLock: true, biometricEnabled: true });
    } else {
      const r = await disableLock();
      if (!r.success) return Alert.alert('Could not disable', r.error);
      await updateSecurity({ appLock: false, biometricEnabled: false });
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can come back anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Settings" title="Adjust the room." />

        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Your privacy matters</Text>
            <Text style={styles.bannerText}>
              Your data is encrypted and yours alone. No judgment. No selling.
            </Text>
          </View>
        </View>

        <Section title="Notifications">
          <Toggle icon="alarm-outline" tint="#E2EAE3"
            label="Daily reminders" sub="Gentle 8 PM check-in"
            value={prefs.dailyReminders} onValueChange={(v) => toggleReminder('dailyReminders', v)} />
          <Toggle icon="leaf-outline" tint="#F5DECF"
            label="Breathing reminders" sub="2 PM breathing nudge"
            value={prefs.breathingReminders} onValueChange={(v) => toggleReminder('breathingReminders', v)} />
          <Toggle icon="stats-chart-outline" tint="#DCEAE5"
            label="Weekly insights" sub="Sunday morning summary"
            value={prefs.weeklyInsights} onValueChange={(v) => toggleReminder('weeklyInsights', v)} isLast />
        </Section>

        <Section title="General">
          <Link icon="globe-outline" tint="#E8E1F0"
            label="Language" sub={language}
            onPress={() => navigation.navigate('Language')} />
          <Link icon="help-circle-outline" tint="#EFE6D6"
            label="Help & Support" sub="FAQs and contact"
            onPress={() => navigation.navigate('HelpSupport')} isLast />
        </Section>

        <Section title="Privacy & Security">
          <Link icon="document-text-outline" tint="#E2EAE3"
            label="Privacy Policy" sub="How we protect your data"
            onPress={() => navigation.navigate('PrivacyPolicy')} />
          <Link icon="server-outline" tint="#F5DECF"
            label="Data & Storage" sub="Export or delete"
            onPress={() => navigation.navigate('DataStorage')} />
          <Toggle icon="lock-closed-outline" tint="#E8E1F0"
            label="App Lock" sub={`Secure with ${biometricLabel}`}
            value={lockEnabled} onValueChange={toggleAppLock} />
          <Toggle icon="bar-chart-outline" tint="#DCEAE5"
            label="Anonymous analytics" sub="Help us improve"
            value={privacy.analytics} onValueChange={toggleAnalytics} isLast />
        </Section>

        <Section title="Account">
          <Link icon="mail-outline" tint="#EFE6D6"
            label="Contact support" onPress={() => navigation.navigate('HelpSupport')} />
          <Link icon="log-out-outline" tint="#F5DECF"
            label="Sign out" onPress={handleSignOut} danger isLast />
        </Section>

        <Text style={styles.footer}>Stillwater · gentle wellness</Text>
        <Text style={styles.version}>v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Toggle({ icon, tint, label, sub, value, onValueChange, isLast }) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={[styles.rowIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primarySoft }}
        thumbColor={Colors.surface} />
    </View>
  );
}

function Link({ icon, tint, label, sub, onPress, danger, isLast }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.row, isLast && styles.rowLast]}>
      <View style={[styles.rowIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.error : Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && { color: Colors.error }]}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },
  banner: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'center',
    backgroundColor: Colors.surfaceMuted, padding: Spacing.md,
    borderRadius: Radius.lg, marginBottom: Spacing.lg,
  },
  bannerIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: '#E2EAE3', alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary, marginBottom: 2 },
  bannerText: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary, lineHeight: 18 },
  sectionTitle: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, letterSpacing: 1.6,
    textTransform: 'uppercase', marginBottom: Spacing.sm, marginLeft: 4,
  },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.soft },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: FontSizes.md, fontFamily: Fonts.body, color: Colors.textPrimary },
  rowSub: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
  footer: {
    fontSize: FontSizes.sm, fontFamily: Fonts.displayItalic,
    color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md,
  },
  version: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
}); 