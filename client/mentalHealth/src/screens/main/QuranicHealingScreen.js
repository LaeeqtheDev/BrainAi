import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import {
  getVersesByCategory, getFavoriteVerses, toggleFavoriteVerse,
} from '../../services/quranService';

import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

const CATEGORIES = [
  { key: 'all', label: 'All Verses' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'stress', label: 'Stress Relief' },
  { key: 'hope', label: 'Hope' },
  { key: 'patience', label: 'Patience' },
  { key: 'peace', label: 'Peace' },
];

const CARD_TINTS = ['#EFE6D6', '#E2EAE3', '#F5DECF', '#E8E1F0', '#DCEAE5'];

export default function QuranicHealingScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [verses, setVerses] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [playingId, setPlayingId] = useState(null);
  const [loadingAudioId, setLoadingAudioId] = useState(null);
  const soundRef = useRef(null);

  // Load verses for the active category (or favorites)
  const loadVerses = useCallback(async (cat) => {
    setLoading(true);
    try {
      if (cat === 'favorites') {
        const favs = await getFavoriteVerses();
        setVerses(favs);
      } else {
        const data = await getVersesByCategory(cat);
        setVerses(data || []);
      }
    } catch (e) {
      console.log('Verses load error:', e.message);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load favorites separately so we can show heart state across categories
  const loadFavorites = useCallback(async () => {
    try {
      const favs = await getFavoriteVerses();
      setFavorites(favs.map((f) => f.verseId || f.id));
    } catch (e) {
      console.log('Favorites load error:', e.message);
    }
  }, []);

  useEffect(() => {
    loadVerses(activeCategory);
  }, [activeCategory, loadVerses]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      // Stop audio when leaving screen
      return () => {
        stopAudio();
      };
    }, [loadFavorites])
  );

  const stopAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch {}
    setPlayingId(null);
    setLoadingAudioId(null);
  };

  const toggleFav = async (verse) => {
    const verseId = verse.verseId || verse.id;
    const isFav = favorites.includes(verseId);

    // Optimistic UI
    setFavorites((prev) => isFav ? prev.filter((id) => id !== verseId) : [...prev, verseId]);

    const result = await toggleFavoriteVerse(verse);
    if (!result.success) {
      // Revert on failure
      setFavorites((prev) => isFav ? [...prev, verseId] : prev.filter((id) => id !== verseId));
      Alert.alert('Could not save', result.error || 'Try again.');
      return;
    }

    // Refresh favorites view if we're currently looking at it
    if (activeCategory === 'favorites') {
      loadVerses('favorites');
    }
  };

  const playAudio = async (verse) => {
    const verseId = verse.verseId || verse.id;
    console.log('🎵 playAudio:', { verseId, audioUrl: verse.audioUrl });

    // If this verse is currently playing → stop it (toggle behavior)
    if (playingId === verseId) {
      console.log('🛑 Toggling off');
      await stopAudio();
      return;
    }

    // If a different verse is playing, unload it first
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
    }

    if (!verse.audioUrl) {
      Alert.alert('Audio unavailable', 'No recitation URL on this verse.');
      return;
    }

    setLoadingAudioId(verseId);

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      console.log('⬇️  Loading audio:', verse.audioUrl);
      const { sound } = await Audio.Sound.createAsync(
        { uri: verse.audioUrl },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setLoadingAudioId(null);
      setPlayingId(verseId);
      console.log('▶️  Playing');

      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.error) {
          console.log('🔥 Playback error:', s.error);
          Alert.alert('Playback error', s.error);
          stopAudio();
          return;
        }
        if (s.didJustFinish) {
          console.log('✅ Finished');
          stopAudio();
        }
      });
    } catch (e) {
      console.log('💥 Audio error:', e.message);
      Alert.alert('Could not play', e.message);
      setLoadingAudioId(null);
      setPlayingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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

        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons name="book-outline" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Spiritual Wellness</Text>
            <Text style={styles.introText}>
              Listen, reflect, find solace. Recitation by Mishary Rashid Alafasy.
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => {
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

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : verses.length === 0 ? (
          <Text style={styles.empty}>
            {activeCategory === 'favorites'
              ? 'No favorites yet — tap the heart on any verse to save it.'
              : 'No verses available right now.'}
          </Text>
        ) : (
          verses.map((v, i) => {
            const verseId = v.verseId || v.id;
            const isFav = favorites.includes(verseId);
            const isPlaying = playingId === verseId;
            const isLoadingThis = loadingAudioId === verseId;

            return (
              <View
                key={verseId}
                style={[styles.verseCard, { backgroundColor: CARD_TINTS[i % CARD_TINTS.length] }]}
              >
                <View style={styles.verseHeader}>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagText}>{v.tag}</Text>
                  </View>

                  <TouchableOpacity onPress={() => toggleFav(v)} style={styles.favBtn}>
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
                  style={[styles.audioBtn, isPlaying && styles.audioBtnActive]}
                  onPress={() => playAudio(v)}
                  activeOpacity={0.85}
                  disabled={isLoadingThis}
                >
                  {isLoadingThis ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Ionicons
                      name={isPlaying ? 'stop' : 'play'}
                      size={16}
                      color={Colors.primary}
                    />
                  )}
                  <Text style={styles.audioText}>
                    {isLoadingThis ? 'Loading…' : isPlaying ? 'Stop' : 'Play recitation'}
                  </Text>
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
  empty: {
    textAlign: 'center', fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textMuted, marginTop: Spacing.xl, paddingHorizontal: Spacing.lg, lineHeight: 20,
  },
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 12, borderRadius: Radius.pill,
  },
  audioBtnActive: {
    backgroundColor: Colors.surface,
  },
  audioText: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.primary, letterSpacing: 0.3 },
});