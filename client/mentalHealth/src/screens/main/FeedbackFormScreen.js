import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Input from '../../components/common/Input';
import Button from '../../components/common//Button';
import ScreenHeader from '../../components/common/ScreenHeader';
import { apiPost } from '../../services/apiService';
import { Colors, Spacing, Fonts, FontSizes } from '../../config/theme';

const TOPICS = ['Bug', 'Suggestion', 'Question', 'Other'];

export default function FeedbackFormScreen({ navigation }) {
  const [topic, setTopic] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return Alert.alert('Add a message', 'Tell us what you want to share.');
    setSending(true);
    try {
      // POST /api/feedback expects { topic, message } — wire on backend if needed
      await apiPost('/api/feedback', { topic, message });
      Alert.alert('Sent', 'Thanks for taking the time. We read every note.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Could not send', e.message);
    } finally { setSending(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScreenHeader eyebrow="Feedback" title="Tell us anything." subtitle="We read every message." />

          <Text style={styles.label}>Topic</Text>
          <View style={styles.topics}>
            {TOPICS.map((t) => {
              const active = t === topic;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTopic(t)}
                  style={[styles.topic, active && styles.topicActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.topicText, active && styles.topicTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Your message"
            value={message}
            onChangeText={setMessage}
            placeholder="What's on your mind?"
            autoCapitalize="sentences"
          />

          <Button title="Send" onPress={send} loading={sending} style={{ marginTop: Spacing.md }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  label: {
    fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, marginBottom: 8, letterSpacing: 0.3,
  },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  topic: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 999, borderWidth: 1, borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  topicActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  topicText: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  topicTextActive: { color: Colors.textOnDark },
});