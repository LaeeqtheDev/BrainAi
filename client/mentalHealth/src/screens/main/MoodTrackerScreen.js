import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../../components/common/ScreenHeader';
import Button from '../../components/common/Button';
import MoodLineChart from '../../components/MoodLineChart';
import EmotionBarChart from '../../components/EmotionBarChart';
import { MOODS, saveMood, getRecentMoods } from '../../services/moodService';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

const RANGES = [
  { key: 'week',  label: 'This Week',  days: 7 },
  { key: 'month', label: 'This Month', days: 30 },
  { key: 'all',   label: 'All Time',   days: 365 },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MoodTrackerScreen() {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [recent, setRecent] = useState([]);
  const [range, setRange] = useState('week');

  const load = useCallback(async () => {
    const moods = await getRecentMoods(365);
    setRecent(moods);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!selected) {
      Alert.alert('Pick a mood', "Choose how you're feeling first.");
      return;
    }
    setSaving(true);
    const res = await saveMood({ moodKey: selected, note });
    setSaving(false);

    if (res.success) {
      setSelected(null); setNote(''); load();
    } else {
      Alert.alert('Could not save', res.error || 'Try again');
    }
  };

  // Filter by range
  const filteredMoods = useMemo(() => {
    const days = RANGES.find((r) => r.key === range).days;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return recent.filter((m) => new Date(m.createdAtIso).getTime() >= cutoff);
  }, [recent, range]);

  // Build line chart data — last 7 days, latest mood per day
  const chartData = useMemo(() => {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 30; // cap chart at 30 points
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const buckets = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const dayMoods = recent.filter((m) => {
        const md = new Date(m.createdAtIso); md.setHours(0, 0, 0, 0);
        return md.getTime() === d.getTime();
      });
      const meta = dayMoods.length
        ? MOODS.find((mm) => mm.key === dayMoods[0].moodKey)
        : null;
      buckets.push({
        label: days <= 7 ? DAY_LABELS[d.getDay()] : `${d.getDate()}`,
        value: meta ? meta.value : null,
      });
    }
    return buckets;
  }, [recent, range]);

  // Emotion breakdown bars
  const breakdown = useMemo(() => {
    return MOODS.map((m) => ({
      label: m.label, emoji: m.emoji,
      value: filteredMoods.filter((x) => x.moodKey === m.key).length,
    }));
  }, [filteredMoods]);

  // Insights
  const insights = useMemo(() => {
    const out = [];
    const values = filteredMoods
      .map((m) => MOODS.find((x) => x.key === m.moodKey)?.value)
      .filter(Boolean);

    if (values.length >= 4) {
      const half = Math.floor(values.length / 2);
      const recentAvg = values.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const olderAvg = values.slice(half).reduce((a, b) => a + b, 0) / (values.length - half);
      const delta = recentAvg - olderAvg;

      if (delta > 0.4) {
        out.push({
          icon: 'trending-up', tint: '#E2EAE3',
          title: 'Trending upward',
          text: 'Your mood has been a little brighter lately. Notice what\'s helping.',
        });
      } else if (delta < -0.4) {
        out.push({
          icon: 'trending-down', tint: '#F5DECF',
          title: 'Heavier days',
          text: 'Recent moods have dipped. Be especially gentle with yourself.',
        });
      }
    }

    if (filteredMoods.length > 0) {
      const counts = {};
      filteredMoods.forEach((m) => { counts[m.moodKey] = (counts[m.moodKey] || 0) + 1; });
      const topKey = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      const meta = MOODS.find((x) => x.key === topKey);
      if (meta) {
        out.push({
          icon: 'sparkles', tint: '#EFE6D6',
          title: `Mostly ${meta.label.toLowerCase()}`,
          text: `${meta.emoji} You logged "${meta.label}" most often this ${range === 'week' ? 'week' : 'period'}.`,
        });
      }
    }

    if (filteredMoods.length >= 5) {
      out.push({
        icon: 'medal-outline', tint: '#E8E1F0',
        title: 'Showing up',
        text: `${filteredMoods.length} check-ins. The act of noticing matters.`,
      });
    }

    return out;
  }, [filteredMoods, range]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <ScreenHeader
            eyebrow="Mood tracker"
            title="How are you?"
            subtitle="There's no wrong answer. Just notice."
          />

          {/* Mood picker */}
          <View style={styles.moodGrid}>
            {MOODS.map((m) => {
              const active = selected === m.key;
              return (
                <TouchableOpacity
                  key={m.key} activeOpacity={0.85}
                  onPress={() => setSelected(m.key)}
                  style={[styles.moodTile, active && styles.moodTileActive]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, active && styles.moodLabelActive]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.noteWrap}>
            <Text style={styles.noteLabel}>A line about it (optional)</Text>
            <TextInput
              value={note} onChangeText={setNote}
              placeholder="What's behind this feeling?"
              placeholderTextColor={Colors.textMuted}
              multiline style={styles.noteInput}
            />
          </View>

          <Button title="Save check-in" onPress={handleSave} loading={saving} />

          {/* Range tabs */}
          <View style={styles.rangeTabs}>
            {RANGES.map((r) => {
              const active = r.key === range;
              return (
                <TouchableOpacity
                  key={r.key} onPress={() => setRange(r.key)}
                  style={[styles.rangeTab, active && styles.rangeTabActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.rangeText, active && styles.rangeTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Mood trend chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="trending-up" size={18} color={Colors.primary} />
              <Text style={styles.chartTitle}>Mood Trends</Text>
            </View>
            <MoodLineChart data={chartData} />
          </View>

          {/* Emotion breakdown */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="bar-chart-outline" size={18} color={Colors.primary} />
              <Text style={styles.chartTitle}>Emotion Breakdown</Text>
            </View>
            <EmotionBarChart data={breakdown} />
          </View>

          {/* Insights */}
          <Text style={styles.sectionTitle}>Your insights</Text>
          {insights.length === 0 ? (
            <Text style={styles.empty}>Log a few moods to start seeing patterns.</Text>
          ) : (
            insights.map((ins, i) => (
              <View key={i} style={styles.insightCard}>
                <View style={[styles.insightIcon, { backgroundColor: ins.tint }]}>
                  <Ionicons name={ins.icon} size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.insightTitle}>{ins.title}</Text>
                  <Text style={styles.insightText}>{ins.text}</Text>
                </View>
              </View>
            ))
          )}

          {/* Recent log */}
          {filteredMoods.length > 0 && (
            <View style={styles.recentWrap}>
              <Text style={styles.sectionTitle}>Recent</Text>
              {filteredMoods.slice(0, 10).map((entry) => {
                const meta = MOODS.find((m) => m.key === entry.moodKey);
                const date = new Date(entry.createdAtIso);
                return (
                  <View key={entry.id} style={styles.recentRow}>
                    <Text style={styles.recentEmoji}>{meta?.emoji || '•'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentLabel}>{meta?.label || entry.moodKey}</Text>
                      {entry.note ? (
                        <Text style={styles.recentNote} numberOfLines={2}>{entry.note}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.recentDate}>
                      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  moodTile: {
    flexBasis: '30%', flexGrow: 1,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent', ...Shadow.soft,
  },
  moodTileActive: { borderColor: Colors.primary, backgroundColor: '#FFFCF6' },
  moodEmoji: { fontSize: 32, marginBottom: 6 },
  moodLabel: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.textSecondary },
  moodLabelActive: { color: Colors.primary },
  noteWrap: { marginBottom: Spacing.lg },
  noteLabel: {
    fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, marginBottom: 8, letterSpacing: 0.3,
  },
  noteInput: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md,
    fontSize: FontSizes.md, fontFamily: Fonts.body,
    color: Colors.textPrimary, minHeight: 100, textAlignVertical: 'top',
  },
  rangeTabs: {
    flexDirection: 'row', gap: 8, marginTop: Spacing.xl, marginBottom: Spacing.md,
  },
  rangeTab: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  rangeTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rangeText: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  rangeTextActive: { color: Colors.textOnDark },
  chartCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.soft,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  chartTitle: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  sectionTitle: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, letterSpacing: 1.6,
    textTransform: 'uppercase', marginBottom: Spacing.md, marginTop: Spacing.lg,
  },
  empty: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textMuted, textAlign: 'center' },
  insightCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.soft,
  },
  insightIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  insightTitle: {
    fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium,
    color: Colors.textPrimary, marginBottom: 4,
  },
  insightText: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary, lineHeight: 20,
  },
  recentWrap: { marginTop: Spacing.lg },
  recentRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.soft,
  },
  recentEmoji: { fontSize: 24 },
  recentLabel: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  recentNote: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
  recentDate: { fontSize: FontSizes.xs, fontFamily: Fonts.body, color: Colors.textMuted },
});