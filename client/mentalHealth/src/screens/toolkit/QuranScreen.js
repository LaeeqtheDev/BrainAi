import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/colors';

export default function QuranScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [playingId, setPlayingId] = useState(null);

  const categories = [
    { id: 'all', name: 'All', icon: '📖' },
    { id: 'peace', name: 'Peace', icon: '☮️' },
    { id: 'patience', name: 'Patience', icon: '🕊️' },
    { id: 'hope', name: 'Hope', icon: '🌟' },
    { id: 'gratitude', name: 'Gratitude', icon: '🙏' },
    { id: 'trust', name: 'Trust', icon: '💚' },
  ];

  // Mock data - will come from backend later
  const verses = [
    {
      id: 1,
      surah: 'Ar-Ra\'d',
      ayah: 28,
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      translation: 'Verily, in the remembrance of Allah do hearts find rest.',
      category: 'peace',
      theme: 'Inner Peace',
    },
    {
      id: 2,
      surah: 'Al-Baqarah',
      ayah: 286,
      arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
      translation: 'Allah does not burden a soul beyond that it can bear.',
      category: 'hope',
      theme: 'Relief from Burden',
    },
    {
      id: 3,
      surah: 'Ash-Sharh',
      ayah: 6,
      arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      translation: 'Indeed, with hardship comes ease.',
      category: 'hope',
      theme: 'Hope & Relief',
    },
    {
      id: 4,
      surah: 'Al-Baqarah',
      ayah: 153,
      arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
      translation: 'Indeed, Allah is with the patient.',
      category: 'patience',
      theme: 'Patience & Perseverance',
    },
    {
      id: 5,
      surah: 'Ibrahim',
      ayah: 7,
      arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
      translation: 'If you are grateful, I will surely increase you in favor.',
      category: 'gratitude',
      theme: 'Gratitude & Blessings',
    },
    {
      id: 6,
      surah: 'At-Talaq',
      ayah: 3,
      arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
      translation: 'And whoever relies upon Allah - then He is sufficient for him.',
      category: 'trust',
      theme: 'Trust in Allah',
    },
  ];

  const filteredVerses = selectedCategory === 'all' 
    ? verses 
    : verses.filter(v => v.category === selectedCategory);

  const toggleFavorite = (verseId) => {
    if (favorites.includes(verseId)) {
      setFavorites(favorites.filter(id => id !== verseId));
      Alert.alert('Removed', 'Removed from favorites');
    } else {
      setFavorites([...favorites, verseId]);
      Alert.alert('Saved', 'Added to favorites');
    }
  };

  const handlePlayAudio = (verseId) => {
    if (playingId === verseId) {
      setPlayingId(null);
      Alert.alert('Stopped', 'Audio stopped');
    } else {
      setPlayingId(verseId);
      Alert.alert('Playing', 'Audio playing...\n(Integration with audio API coming soon)');
      // TODO: Connect to Quran audio API
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quranic Healing</Text>
        <TouchableOpacity style={styles.favoritesButton}>
          <Text style={styles.favoritesIcon}>❤️</Text>
          {favorites.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{favorites.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive,
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Verses List */}
      <ScrollView
        contentContainerStyle={styles.versesContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredVerses.map((verse) => (
          <View key={verse.id} style={styles.verseCard}>
            {/* Theme Badge */}
            <View style={styles.verseTheme}>
              <Text style={styles.verseThemeText}>{verse.theme}</Text>
            </View>

            {/* Arabic Text */}
            <Text style={styles.arabicText}>{verse.arabic}</Text>

            {/* Translation */}
            <Text style={styles.translationText}>{verse.translation}</Text>

            {/* Reference */}
            <Text style={styles.referenceText}>
              {verse.surah} {verse.ayah}
            </Text>

            {/* Actions */}
            <View style={styles.verseActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handlePlayAudio(verse.id)}
              >
                <Text style={styles.actionIcon}>
                  {playingId === verse.id ? '⏸️' : '▶️'}
                </Text>
                <Text style={styles.actionText}>
                  {playingId === verse.id ? 'Playing' : 'Listen'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  favorites.includes(verse.id) && styles.actionButtonFavorite,
                ]}
                onPress={() => toggleFavorite(verse.id)}
              >
                <Text style={styles.actionIcon}>
                  {favorites.includes(verse.id) ? '❤️' : '🤍'}
                </Text>
                <Text style={styles.actionText}>
                  {favorites.includes(verse.id) ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  favoritesButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoritesIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef5350',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.large,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: '#4a6741',
    borderColor: '#4a6741',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: FontSizes.small,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  versesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  verseCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  verseTheme: {
    backgroundColor: '#f0f4ef',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
    marginBottom: Spacing.md,
  },
  verseThemeText: {
    fontSize: FontSizes.small - 1,
    color: '#4a6741',
    fontWeight: '600',
  },
  arabicText: {
    fontSize: FontSizes.xxlarge,
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: 40,
    marginBottom: Spacing.md,
    fontWeight: '500',
  },
  translationText: {
    fontSize: FontSizes.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  referenceText: {
    fontSize: FontSizes.small,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  verseActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.medium,
  },
  actionButtonFavorite: {
    backgroundColor: '#ffe8e8',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    fontSize: FontSizes.small,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});