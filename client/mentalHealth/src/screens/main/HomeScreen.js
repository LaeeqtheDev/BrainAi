import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { getRecentMoods, MOODS, saveMood } from '../../services/moodService';
import { getJournalEntries } from '../../services/journalService';
import { getCachedAffirmation, getDailyAffirmation } from '../../services/quoteService';

import { Colors, Spacing, FontSizes, Fonts, Radius, Shadow } from '../../config/theme';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const FEATURE_CARDS = [
  { key: 'Chatbot',        title: 'AI companion',    sub: 'Talk it through',   icon: 'chatbubbles-outline', tint: '#E2EAE3' },
  { key: 'Mood',           title: 'Mood tracker',    sub: 'See your weather',  icon: 'pulse-outline',       tint: '#F5DECF' },
  { key: 'Journal',        title: 'Journal',         sub: 'Pages of you',      icon: 'book-outline',        tint: '#EFE6D6' },
  { key: 'Breathing',      title: 'Breathing',       sub: 'Calm your mind',    icon: 'leaf-outline',        tint: '#DCEAE5' },
  { key: 'QuranicHealing', title: 'Quranic healing', sub: 'Find solace',       icon: 'sparkles-outline',    tint: '#E8E1F0', wide: true },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [latestMood, setLatestMood] = useState(null);
  const [journalCount, setJournalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [savingMood, setSavingMood] = useState(false);
  const [affirmation, setAffirmation] = useState('');

  const firstName = (user?.displayName || 'friend').split(' ')[0];

  const load = useCallback(async () => {
    try {
      // 1) Show cached affirmation INSTANTLY (no waiting)
      const cached = await getCachedAffirmation();
      setAffirmation(cached);

      // 2) Load everything in parallel — moods, journal, fresh affirmation
      const [moods, entries, fresh] = await Promise.all([
        getRecentMoods(1),
        getJournalEntries(),
        getDailyAffirmation(),
      ]);

      setLatestMood(moods[0] || null);
      setJournalCount(entries.length);

      // 3) Quietly swap to the fresh affirmation if it came back.
      //    If null (network failed), keep showing the cached one.
      if (fresh) setAffirmation(fresh);
    } catch (err) {
      console.log('Home load error:', err);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const quickLogMood = async (moodKey) => {
    if (savingMood) return;
    setSavingMood(true);

    const res = await saveMood({ moodKey, note: '' });

    setSavingMood(false);

    if (res.success) {
      load();
      Alert.alert('Logged', "We've noted how you're feeling. Want to write a line?", [
        { text: 'Not now', style: 'cancel' },
        { text: 'Write', onPress: () => navigation.navigate('Mood') },
      ]);
    }
  };

  const moodMeta = latestMood ? MOODS.find((m) => m.key === latestMood.moodKey) : null;

  const navTo = (key) => {
    navigation.navigate(key);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <Text style={styles.greeting}>{greeting()},</Text>
        <Text style={styles.name}>{firstName}.</Text>

        {/* Quick mood */}
        <View style={styles.moodCard}>
          <Text style={styles.moodCardTitle}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                onPress={() => quickLogMood(m.key)}
                style={styles.moodPick}
                activeOpacity={0.85}
                disabled={savingMood}
              >
                <Text style={styles.moodPickEmoji}>{m.emoji}</Text>
                <Text style={styles.moodPickLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily affirmation — cached instantly, refreshed silently */}
        {affirmation ? (
          <View style={styles.reminder}>
            <Text style={styles.reminderLabel}>A note for today</Text>
            <Text style={styles.reminderText}>"{affirmation}"</Text>
          </View>
        ) : null}

        {/* Feature grid */}
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.grid}>
          {FEATURE_CARDS.map((f) => (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.85}
              onPress={() => navTo(f.key)}
              style={[styles.featureCard, f.wide && styles.featureCardWide]}
            >
              <View style={[styles.featureIcon, { backgroundColor: f.tint }]}>
                <Ionicons name={f.icon} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureSub}>{f.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>At a glance</Text>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{moodMeta ? moodMeta.emoji : '—'}</Text>
            <Text style={styles.statLabel}>Last mood</Text>
            <Text style={styles.statSub}>{moodMeta ? moodMeta.label : 'Not yet logged'}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statValue, { fontFamily: Fonts.display }]}>{journalCount}</Text>
            <Text style={styles.statLabel}>Entries</Text>
            <Text style={styles.statSub}>
              {journalCount === 1 ? 'reflection' : 'reflections'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },

  greeting: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  name: {
    fontSize: 44,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.lg,
  },

  moodCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.soft,
  },

  moodCardTitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },

  moodPick: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },

  moodPickEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },

  moodPickLabel: {
    fontSize: 11,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },

  reminder: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  reminderLabel: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.bodyMedium,
    color: Colors.accent,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  reminderText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.displayItalic,
    color: Colors.textPrimary,
    lineHeight: 26,
  },

  sectionTitle: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },

  featureCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.soft,
  },

  featureCardWide: {
    flexBasis: '100%',
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },

  featureTitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },

  featureSub: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },

  statRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },

  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.soft,
  },

  statValue: {
    fontSize: 32,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  statSub: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.body,
    color: Colors.textMuted,
    marginTop: 2,
  },
});