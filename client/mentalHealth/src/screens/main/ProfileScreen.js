import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/authService';
import { getMe } from '../../services/settingsService';
import { getRecentMoods } from '../../services/moodService';
import { getJournalEntries } from '../../services/journalService';
import ScreenHeader from '../../components/common/ScreenHeader';
import Button from '../../components/common/Button';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

export default function ProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState({ moods: 0, entries: 0 });

  const load = useCallback(async () => {
    const [profile, moods, entries] = await Promise.all([
      getMe(), getRecentMoods(1000), getJournalEntries(),
    ]);
    setMe(profile);
    setStats({ moods: moods.length, entries: entries.length });
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can come back anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const name = me?.name || user?.displayName || 'Friend';
  const initials = (name || user?.email || '?')
    .split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="Profile" title="Your space." />

        <View style={styles.profileCard}>
          {me?.profilePicture ? (
            <Image source={{ uri: me.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {me?.bio ? <Text style={styles.bio}>{me.bio}</Text> : null}
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
          <MenuRow icon="person-outline" tint="#E2EAE3" label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
          <MenuRow icon="notifications-outline" tint="#F5DECF" label="Reminders" onPress={() => navigation.navigate('Reminders')} />
          <MenuRow icon="shield-checkmark-outline" tint="#DCEAE5" label="Privacy" onPress={() => navigation.navigate('PrivacySettings')} isLast />
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

function MenuRow({ icon, tint, label, onPress, isLast }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.menuRow, isLast && styles.menuRowLast]}>
      <View style={[styles.menuIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
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
    padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md, ...Shadow.soft,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: Spacing.md },
  avatarFallback: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.textOnDark, fontSize: 28, fontFamily: Fonts.display, letterSpacing: 1 },
  name: { fontSize: FontSizes.xl, fontFamily: Fonts.display, color: Colors.textPrimary, marginBottom: 4 },
  email: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary },
  bio: {
    fontSize: FontSizes.sm, fontFamily: Fonts.displayItalic,
    color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center', lineHeight: 20,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  statBox: {
    flex: 1, backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center',
  },
  statValue: { fontSize: 32, fontFamily: Fonts.display, color: Colors.primary, marginBottom: 4 },
  statLabel: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, letterSpacing: 1.4, textTransform: 'uppercase',
  },
  menuGroup: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.soft },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FontSizes.md, fontFamily: Fonts.body, color: Colors.textPrimary },
});