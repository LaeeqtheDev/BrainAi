import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { QURAN_VERSES, VERSE_CATEGORIES } from '../../data/quranVerses';
import { getVersesByCategory } from '../../services/quranService';

import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

const CARD_TINTS = ['#EFE6D6', '#E2EAE3', '#F5DECF', '#E8E1F0', '#DCEAE5'];

export default function QuranicHealingScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [verses, setVerses] = useState(QURAN_VERSES);
  const [loading, setLoading] = useState(false);

  // Load verses (backend → fallback local)
  const loadVerses = useCallback(async () => {
    setLoading(true);
    try {
      const remote =
        activeCategory === 'all'
          ? await getVersesByCategory('all')
          : await getVersesByCategory(activeCategory);

      if (remote && remote.length) {
        setVerses(remote);
      }
    } catch (e) {
      // silent fallback → local data already active
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadVerses();
  }, [loadVerses]);

  useFocusEffect(
    useCallback(() => {
      // favorites are session-only (no persistence)
    }, [])
  );

  // Local favorites only (NO backend)
  const toggleFav = (verseId) => {
    setFavorites((prev) => {
      const exists = prev.includes(verseId);
      return exists
        ? prev.filter((id) => id !== verseId)
        : [...prev, verseId];
    });
  };

  const filtered =
    activeCategory === 'all'
      ? verses
      : activeCategory === 'favorites'
      ? verses.filter((v) => favorites.includes(v.id))
      : verses.filter((v) => v.category === activeCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScreenHeader
          eyebrow="Quranic Healing"
          title="Find peace in His words."
          subtitle="Verses to comfort, ground, and remind."
        />

        {/* Intro */}
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons name="book-outline" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Spiritual Wellness</Text>
            <Text style={styles.introText}>
              These verses offer comfort, hope, and guidance during challenging times.
            </Text>
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {VERSE_CATEGORIES.map((c) => {
              const active = activeCategory === c.key;
              return (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setActiveCategory(c.key)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Content */}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>No verses in this category yet.</Text>
        ) : (
          filtered.map((v, i) => {
            const isFav = favorites.includes(v.id);

            return (
              <View
                key={v.id}
                style={[
                  styles.verseCard,
                  { backgroundColor: CARD_TINTS[i % CARD_TINTS.length] },
                ]}
              >
                <View style={styles.verseHeader}>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagText}>{v.tag}</Text>
                  </View>

                  <TouchableOpacity onPress={() => toggleFav(v.id)} style={styles.favBtn}>
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFav ? Colors.error : Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.arabic}>{v.arabic}</Text>
                <Text style={styles.translation}>"{v.translation}"</Text>
                <Text style={styles.reference}>{v.reference}</Text>

                <TouchableOpacity
                  style={styles.audioBtn}
                  onPress={() => Alert.alert('Audio', 'Recitation playback is coming soon.')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="play" size={16} color={Colors.primary} />
                  <Text style={styles.audioText}>Play Audio</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

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
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  intro: {
    flexDirection: 'row', gap: Spacing.md,
    backgroundColor: Colors.surface, padding: Spacing.md,
    borderRadius: Radius.lg, marginBottom: Spacing.lg, ...Shadow.soft,
  },
  introIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  introTitle: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary, marginBottom: 4 },
  introText: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary, lineHeight: 20 },
  chipScroll: { marginBottom: Spacing.lg },
  chipRow: { flexDirection: 'row', gap: 8, paddingRight: Spacing.lg },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  chipTextActive: { color: Colors.textOnDark },
  empty: { textAlign: 'center', fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textMuted, marginTop: Spacing.xl },
  verseCard: { borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  verseHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tagPill: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill,
  },
  tagText: { fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium, color: Colors.textSecondary, letterSpacing: 0.4 },
  favBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  arabic: {
    fontSize: 22, color: Colors.textPrimary, textAlign: 'center',
    lineHeight: 40, marginVertical: Spacing.md, writingDirection: 'rtl',
  },
  translation: {
    fontSize: FontSizes.md, fontFamily: Fonts.displayItalic,
    color: Colors.textPrimary, textAlign: 'center',
    lineHeight: 24, marginBottom: 6,
  },
  reference: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, textAlign: 'center',
    letterSpacing: 0.6, marginBottom: Spacing.md,
  },
  audioBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingVertical: 12, borderRadius: Radius.pill,
  },
  audioText: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.primary, letterSpacing: 0.3 },
});