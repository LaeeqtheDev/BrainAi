import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/colors';

export default function JournalScreen({ navigation }) {
  const [isWriting, setIsWriting] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  // Mock previous entries - will come from backend later
  const [entries, setEntries] = useState([
    {
      id: 1,
      content: 'Today was a good day. I felt calm and focused at work. Had a nice walk in the evening.',
      emotion: 'calm',
      date: new Date('2024-04-24'),
    },
    {
      id: 2,
      content: 'Feeling a bit stressed about the upcoming presentation. Need to practice more.',
      emotion: 'stressed',
      date: new Date('2024-04-23'),
    },
    {
      id: 3,
      content: 'Grateful for my family and friends. Had a wonderful dinner together.',
      emotion: 'grateful',
      date: new Date('2024-04-22'),
    },
  ]);

  const emotions = [
    { label: 'Happy', emoji: '😊', value: 'happy' },
    { label: 'Sad', emoji: '😢', value: 'sad' },
    { label: 'Stressed', emoji: '😰', value: 'stressed' },
    { label: 'Calm', emoji: '😌', value: 'calm' },
    { label: 'Anxious', emoji: '😟', value: 'anxious' },
    { label: 'Grateful', emoji: '🙏', value: 'grateful' },
    { label: 'Tired', emoji: '😴', value: 'tired' },
    { label: 'Hopeful', emoji: '🌟', value: 'hopeful' },
  ];

  const handleSave = () => {
    if (!journalText.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    const newEntry = {
      id: entries.length + 1,
      content: journalText,
      emotion: selectedEmotion,
      date: new Date(),
    };

    setEntries([newEntry, ...entries]);
    setJournalText('');
    setSelectedEmotion(null);
    setIsWriting(false);
    Alert.alert('Saved!', 'Your journal entry has been saved.');
  };

  const formatDate = (date) => {
    const today = new Date();
    const entryDate = new Date(date);
    
    if (entryDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (entryDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#81c784',
      sad: '#64b5f6',
      stressed: '#ffb74d',
      calm: '#4dd0e1',
      anxious: '#ef5350',
      grateful: '#ba68c8',
      tired: '#90a4ae',
      hopeful: '#ffd54f',
    };
    return colors[emotion] || '#b0bec5';
  };

  if (isWriting) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setIsWriting(false);
              setJournalText('');
              setSelectedEmotion(null);
            }}
          >
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Entry</Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.editorContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Emotion Tags */}
          <View style={styles.emotionSection}>
            <Text style={styles.emotionSectionTitle}>How are you feeling?</Text>
            <View style={styles.emotionTags}>
              {emotions.map((emotion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emotionTag,
                    selectedEmotion === emotion.value && {
                      backgroundColor: getEmotionColor(emotion.value),
                      borderColor: getEmotionColor(emotion.value),
                    },
                  ]}
                  onPress={() => setSelectedEmotion(emotion.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emotionTagEmoji}>{emotion.emoji}</Text>
                  <Text style={[
                    styles.emotionTagText,
                    selectedEmotion === emotion.value && { color: Colors.white },
                  ]}>
                    {emotion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Text Editor */}
          <TextInput
            style={styles.textEditor}
            placeholder="What's on your mind today?&#10;&#10;Write freely about your thoughts, feelings, and experiences..."
            placeholderTextColor={Colors.textLight}
            value={journalText}
            onChangeText={setJournalText}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity 
  style={styles.backButton}
  onPress={() => navigation.navigate('HomeTab')}
>
  <Text style={styles.backIcon}>←</Text>
</TouchableOpacity>
        <Text style={styles.headerTitle}>Journal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* New Entry Button */}
        <TouchableOpacity 
          style={styles.newEntryButton}
          onPress={() => setIsWriting(true)}
        >
          <Text style={styles.newEntryIcon}>✏️</Text>
          <Text style={styles.newEntryText}>Write New Entry</Text>
        </TouchableOpacity>

        {/* Entries List */}
        <View style={styles.entriesSection}>
          <Text style={styles.entriesSectionTitle}>Your Entries ({entries.length})</Text>
          
          {entries.map((entry) => (
            <TouchableOpacity 
              key={entry.id} 
              style={styles.entryCard}
              activeOpacity={0.7}
            >
              <View style={styles.entryHeader}>
                <View style={styles.entryDateContainer}>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                  {entry.emotion && (
                    <View style={[styles.entryEmotionBadge, { backgroundColor: getEmotionColor(entry.emotion) }]}>
                      <Text style={styles.entryEmotionText}>{entry.emotion}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.entryContent} numberOfLines={3}>
                {entry.content}
              </Text>
              <Text style={styles.entryReadMore}>Read more →</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  placeholder: {
    width: 40,
  },
  saveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  saveButtonText: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: '#4a6741',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a6741',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md + 4,
    borderRadius: BorderRadius.large,
    shadowColor: '#4a6741',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newEntryIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  newEntryText: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: Colors.white,
  },
  entriesSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  entriesSectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  entryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    marginBottom: Spacing.sm,
  },
  entryDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  entryDate: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  entryEmotionBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
  },
  entryEmotionText: {
    fontSize: FontSizes.small - 1,
    color: Colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  entryContent: {
    fontSize: FontSizes.medium,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  entryReadMore: {
    fontSize: FontSizes.small,
    color: '#4a6741',
    fontWeight: '500',
  },
  editorContainer: {
    padding: Spacing.lg,
  },
  emotionSection: {
    marginBottom: Spacing.lg,
  },
  emotionSectionTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emotionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.large,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emotionTagEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  emotionTagText: {
    fontSize: FontSizes.small,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  textEditor: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    fontSize: FontSizes.medium,
    color: Colors.textPrimary,
    minHeight: 400,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});