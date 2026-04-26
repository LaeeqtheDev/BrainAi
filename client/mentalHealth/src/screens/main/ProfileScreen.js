import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/authService';
import { getRecentMoods } from '../../services/moodService';
import { getJournalEntries } from '../../services/journalService';
import ScreenHeader from '../../components/common/ScreenHeader';
import Button from '../../components/common/Button';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ moods: 0, entries: 0 });

  const load = useCallback(async () => {
    const [moods, entries] = await Promise.all([
      getRecentMoods(1000),
      getJournalEntries(),
    ]);
    setStats({ moods: moods.length, entries: entries.length });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can come back anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const initials = (user?.displayName || user?.email || '?')
    .split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Profile" title="Your space." />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.displayName || 'Friend'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.moods}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.entries}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
        </View>

        <View style={styles.menuGroup}>
          <MenuRow icon="person-outline" label="Edit profile" onPress={() => Alert.alert('Coming soon')} />
          <MenuRow icon="notifications-outline" label="Reminders" onPress={() => Alert.alert('Coming soon')} />
          <MenuRow icon="shield-checkmark-outline" label="Privacy" onPress={() => Alert.alert('Coming soon')} />
        </View>

        <Button
          title="Sign out"
          variant="secondary"
          onPress={handleSignOut}
          icon={<Ionicons name="log-out-outline" size={18} color={Colors.textPrimary} />}
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({ icon, label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.menuRow}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },
  profileCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, alignItems: 'center', ...Shadow.soft,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: Colors.textOnDark, fontSize: 28,
    fontFamily: Fonts.display, letterSpacing: 1,
  },
  name: {
    fontSize: FontSizes.xl, fontFamily: Fonts.display,
    color: Colors.textPrimary, marginBottom: 4,
  },
  email: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  statBox: {
    flex: 1, backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center',
  },
  statValue: {
    fontSize: 32, fontFamily: Fonts.display,
    color: Colors.primary, marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, letterSpacing: 1.4, textTransform: 'uppercase',
  },
  menuGroup: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    overflow: 'hidden', ...Shadow.soft,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuLabel: {
    flex: 1, fontSize: FontSizes.md, fontFamily: Fonts.body,
    color: Colors.textPrimary,
  },
});