import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch, Alert, ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getMe, updateNotifications } from '../../services/settingsService';
import { requestPermissions, syncAllReminders } from '../../services/notificationService';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

const REMINDERS = [
  {
    key: 'dailyReminders', icon: 'alarm-outline', tint: '#E2EAE3',
    title: 'Daily check-in', sub: 'Every evening at 8:00 PM',
  },
  {
    key: 'breathingReminders', icon: 'leaf-outline', tint: '#F5DECF',
    title: 'Breathing breaks', sub: 'A pause every afternoon at 2:00 PM',
  },
  {
    key: 'weeklyInsights', icon: 'stats-chart-outline', tint: '#DCEAE5',
    title: 'Weekly insights', sub: 'Sundays at 9:00 AM — your week, gently',
  },
];

export default function RemindersScreen({ navigation }) {
  const [prefs, setPrefs] = useState({
    dailyReminders: true, breathingReminders: true, weeklyInsights: false,
  });
  const [loading, setLoading] = useState(true);
  const [permGranted, setPermGranted] = useState(true);

  useEffect(() => {
    (async () => {
      const granted = await requestPermissions();
      setPermGranted(granted);
      const me = await getMe();
      if (me?.settings?.notifications) setPrefs(me.settings.notifications);
      setLoading(false);
    })();
  }, []);

  const toggle = async (key, value) => {
    if (value && !permGranted) {
      const granted = await requestPermissions();
      setPermGranted(granted);
      if (!granted) {
        return Alert.alert(
          'Notifications off',
          'Please enable notifications for Stillwater in your device settings to receive reminders.'
        );
      }
    }

    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await updateNotifications(next);
    await syncAllReminders(next);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScreenHeader
          eyebrow="Reminders"
          title="Gentle nudges."
          subtitle="Quiet, never noisy. Turn off any you don't need."
        />

        {!permGranted && (
          <View style={styles.warning}>
            <Ionicons name="alert-circle-outline" size={20} color={Colors.accent} />
            <Text style={styles.warningText}>
              Notifications are disabled. Enable them in your device settings to receive reminders.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          {REMINDERS.map((r, i) => (
            <View key={r.key} style={[styles.row, i === REMINDERS.length - 1 && styles.rowLast]}>
              <View style={[styles.icon, { backgroundColor: r.tint }]}>
                <Ionicons name={r.icon} size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{r.title}</Text>
                <Text style={styles.sub}>{r.sub}</Text>
              </View>
              <Switch
                value={prefs[r.key]}
                onValueChange={(v) => toggle(r.key, v)}
                trackColor={{ false: Colors.border, true: Colors.primarySoft }}
                thumbColor={Colors.surface}
              />
            </View>
          ))}
        </View>

        <Text style={styles.footnote}>
          Reminders run on your device — they work even without internet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  headerRow: { paddingTop: Spacing.md, marginBottom: Spacing.md },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  warning: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    backgroundColor: '#FBE9E5', padding: Spacing.md,
    borderRadius: Radius.md, marginBottom: Spacing.md,
  },
  warningText: {
    flex: 1, fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textPrimary, lineHeight: 20,
  },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.soft },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  icon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  sub: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
  footnote: {
    fontSize: FontSizes.xs, fontFamily: Fonts.body,
    color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.lg,
  },
});