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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/colors';

export default function HomeScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    Alert.alert('Mood Logged', `You selected: ${mood}`);
  };

  const moodButtons = [
    { emoji: '😊', label: 'Happy', color: '#FFE8E8' },
    { emoji: '😌', label: 'Calm', color: '#E3F2FD' },
    { emoji: '😐', label: 'Neutral', color: '#FFF9E6' },
    { emoji: '😰', label: 'Stressed', color: '#FFE8D6' },
    { emoji: '😟', label: 'Anxious', color: '#FFE8E8' },
  ];

  const shortcuts = [
    { 
      icon: require('../../assets/Container (1).png'),
      title: 'AI Chatbot', 
      subtitle: 'Talk to your support companion',
      screen: 'Chatbot', 
      bgColor: '#E3F2FD',
    },
    { 
      icon: require('../../assets/Container (2).png'),
      title: 'Mood Tracker', 
      subtitle: 'See your emotional journey',
      screen: 'MoodTracker', 
      bgColor: '#E8F5E9',
    },
    { 
      icon: require('../../assets/Container (3).png'),
      title: 'Journal', 
      subtitle: 'Express your thoughts',
      screen: 'Journal', 
      bgColor: '#F3E5F5',
    },
    { 
      icon: require('../../assets/Container (4).png'),
      title: 'Breathing', 
      subtitle: 'Calm your mind',
      screen: 'Breathing', 
      bgColor: '#FCE4EC',
    },
  ];

  const handleShortcutPress = (screen) => {
    if (screen === 'Chatbot') {
      navigation.navigate('Chatbot');
    } else if (screen === 'MoodTracker') {
      navigation.navigate('MoodTab');
    } else if (screen === 'Journal') {
      navigation.navigate('JournalTab');
    } else if (screen === 'Breathing') {
      navigation.navigate('Breathing');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00ACC1" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
        <LinearGradient
  colors={['#0277BD', '#00ACC1', '#4DD0E1']}
  locations={[0, 0.5, 1]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.headerGradient}
>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.welcomeText}>Welcome back!</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Mood Check-in Card */}
        <View style={styles.moodCard}>
          <View style={styles.moodContainer}>
            {moodButtons.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodButton,
                  { backgroundColor: mood.color },
                  selectedMood === mood.label && styles.moodButtonSelected
                ]}
                onPress={() => handleMoodSelect(mood.label)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Reminder */}
        <View style={styles.section}>
          <View style={styles.reminderCard}>
            <View style={styles.reminderIconContainer}>
              <Text style={styles.reminderIcon}>💡</Text>
            </View>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Daily Reminder</Text>
              <Text style={styles.reminderText}>
                "Peace comes from within. Do not seek it without." Take a moment to breathe deeply.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.shortcutsGrid}>
            {shortcuts.map((shortcut, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.shortcutCard, { backgroundColor: shortcut.bgColor }]}
                onPress={() => handleShortcutPress(shortcut.screen)}
                activeOpacity={0.8}
              >
                <View style={styles.shortcutIconBox}>
                  <Image 
                    source={shortcut.icon} 
                    style={styles.shortcutIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.shortcutTitle}>{shortcut.title}</Text>
                <Text style={styles.shortcutSubtitle}>{shortcut.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quranic Healing */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.quranCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Quran')}
          >
            <View style={styles.quranIconBox}>
              <Image 
                source={require('../../assets/Container (5).png')} 
                style={styles.quranIconImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.quranContent}>
              <Text style={styles.quranTitle}>Quranic Healing</Text>
              <Text style={styles.quranSubtitle}>Find peace through divine verses</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 85,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  moodCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: -60,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '18%',
    aspectRatio: 0.85,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  moodButtonSelected: {
    borderWidth: 0,
    borderColor: '#00ACC1',
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  reminderCard: {
    backgroundColor: '#E0F7FA',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reminderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reminderIcon: {
    fontSize: 24,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00838F',
    marginBottom: 4,
  },
  reminderText: {
    fontSize: 14,
    color: '#00695C',
    lineHeight: 20,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shortcutCard: {
    width: '48%',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    minHeight: 160,
  },
  shortcutIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  shortcutIconImage: {
    width: 56,
    height: 56,
  },
  shortcutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  shortcutSubtitle: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
  },
  quranCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quranIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  quranIconImage: {
    width: 56,
    height: 56,
  },
  quranContent: {
    flex: 1,
  },
  quranTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  quranSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
});