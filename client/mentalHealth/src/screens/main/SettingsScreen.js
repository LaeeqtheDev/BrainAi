import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { signOut } from '../../services/authService';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

export default function SettingsScreen() {
  // Notifications
  const [dailyReminders, setDailyReminders] = useState(true);
  const [breathingReminders, setBreathingReminders] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState(false);
  // Privacy & security
  const [appLock, setAppLock] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can come back anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const placeholder = (label) => Alert.alert(label, 'Coming soon.');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Settings" title="Adjust the room." />

        {/* Privacy banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Your privacy matters</Text>
            <Text style={styles.bannerText}>
              No judgment. Your data stays secure and private. Encrypted in transit.
            </Text>
          </View>
        </View>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingToggle
            icon="alarm-outline" tint="#E2EAE3"
            label="Daily reminders" sub="Gentle check-ins"
            value={dailyReminders} onValueChange={setDailyReminders}
          />
          <SettingToggle
            icon="leaf-outline" tint="#F5DECF"
            label="Breathing reminders" sub="Take mindful breaks"
            value={breathingReminders} onValueChange={setBreathingReminders}
          />
          <SettingToggle
            icon="stats-chart-outline" tint="#DCEAE5"
            label="Weekly insights" sub="Mood summary reports"
            value={weeklyInsights} onValueChange={setWeeklyInsights}
            isLast
          />
        </Section>

        {/* General */}
        <Section title="General">
          <LinkRow icon="globe-outline" tint="#E8E1F0" label="Language" sub="English" onPress={() => placeholder('Language')} />
          <LinkRow icon="help-circle-outline" tint="#EFE6D6" label="Help & Support" sub="FAQs and contact" onPress={() => placeholder('Help & Support')} isLast />
        </Section>

        {/* Privacy & Security */}
        <Section title="Privacy & Security">
          <LinkRow icon="document-text-outline" tint="#E2EAE3" label="Privacy Policy" sub="How we protect your data" onPress={() => placeholder('Privacy Policy')} />
          <LinkRow icon="server-outline" tint="#F5DECF" label="Data & Storage" sub="Manage your information" onPress={() => placeholder('Data & Storage')} />
          <SettingToggle
            icon="lock-closed-outline" tint="#E8E1F0"
            label="App Lock" sub="Secure with biometrics"
            value={appLock} onValueChange={(v) => {
              if (v) Alert.alert('Coming soon', 'Biometric lock will be available in a future update.');
              else setAppLock(false);
            }}
          />
          <SettingToggle
            icon="bar-chart-outline" tint="#DCEAE5"
            label="Anonymous analytics" sub="Help improve the app"
            value={analytics} onValueChange={setAnalytics}
            isLast
          />
        </Section>

        {/* Account */}
        <Section title="Account">
          <LinkRow icon="mail-outline" tint="#EFE6D6" label="Contact support" onPress={() => placeholder('Contact')} />
          <LinkRow icon="log-out-outline" tint="#F5DECF" label="Sign out" onPress={handleSignOut} danger isLast />
        </Section>

        <Text style={styles.footer}>Stillwater · AI-powered mental wellness</Text>
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

function SettingToggle({ icon, tint, label, sub, value, onValueChange, isLast }) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={[styles.rowIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value} onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primarySoft }}
        thumbColor={Colors.surface}
      />
    </View>
  );
}

function LinkRow({ icon, tint, label, sub, onPress, danger, isLast }) {
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
    backgroundColor: '#E2EAE3',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerTitle: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary, marginBottom: 2 },
  bannerText: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary, lineHeight: 18 },
  sectionTitle: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, letterSpacing: 1.6,
    textTransform: 'uppercase', marginBottom: Spacing.sm, marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', ...Shadow.soft,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 36, height: 36, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: FontSizes.md, fontFamily: Fonts.body, color: Colors.textPrimary },
  rowSub: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
  footer: {
    fontSize: FontSizes.sm, fontFamily: Fonts.displayItalic,
    color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.md,
  },
  version: {
    fontSize: FontSizes.xs, fontFamily: Fonts.body,
    color: Colors.textMuted, textAlign: 'center', marginTop: 4,
  },
});