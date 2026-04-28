import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Switch, Alert, ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getMe, updatePrivacy } from '../../services/settingsService';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

const ITEMS = [
  {
    key: 'dataCollection', icon: 'server-outline', tint: '#E2EAE3',
    title: 'Personal data', sub: 'Allow your moods and journal to be saved (required for app features).',
    locked: true,
  },
  {
    key: 'analytics', icon: 'bar-chart-outline', tint: '#DCEAE5',
    title: 'Anonymous analytics', sub: 'Help us improve the app. No personal data shared.',
  },
];

export default function PrivacySettingsScreen({ navigation }) {
  const [prefs, setPrefs] = useState({ dataCollection: true, analytics: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (me?.settings?.privacy) setPrefs(me.settings.privacy);
      setLoading(false);
    })();
  }, []);

  const toggle = async (key, value) => {
    if (key === 'dataCollection' && !value) {
      return Alert.alert(
        'Required',
        'Personal data is required for the app to work. To stop using your data, please delete your account from Data & Storage.'
      );
    }
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await updatePrivacy(next);
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
          eyebrow="Privacy"
          title="What we keep."
          subtitle="You're in control. Everything is encrypted in transit."
        />

        <View style={styles.card}>
          {ITEMS.map((it, i) => (
            <View key={it.key} style={[styles.row, i === ITEMS.length - 1 && styles.rowLast]}>
              <View style={[styles.icon, { backgroundColor: it.tint }]}>
                <Ionicons name={it.icon} size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{it.title}</Text>
                <Text style={styles.sub}>{it.sub}</Text>
              </View>
              <Switch
                value={prefs[it.key]}
                onValueChange={(v) => toggle(it.key, v)}
                disabled={it.locked && prefs[it.key]}
                trackColor={{ false: Colors.border, true: Colors.primarySoft }}
                thumbColor={Colors.surface}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')} style={styles.linkRow}>
          <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
          <Text style={styles.linkText}>Read the full privacy policy</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
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
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceMuted, padding: Spacing.md,
    borderRadius: Radius.lg, marginTop: Spacing.md,
  },
  linkText: { flex: 1, fontSize: FontSizes.md, fontFamily: Fonts.body, color: Colors.textPrimary },
});