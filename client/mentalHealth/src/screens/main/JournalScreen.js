import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../../components/common/ScreenHeader';
import Button from '../../components/common/Button';
import {
  addJournalEntry, getJournalEntries, deleteJournalEntry,
} from '../../services/journalService';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

export default function JournalScreen() {
  const [entries, setEntries] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await getJournalEntries();
    setEntries(data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) {
      Alert.alert('Empty entry', 'Add a title or write something first.');
      return;
    }
    setSaving(true);
    const res = await addJournalEntry({
      title: title.trim() || 'Untitled',
      body,
    });
    setSaving(false);

    if (res.success) {
      setTitle(''); setBody(''); setModalOpen(false);
      load();
    } else {
      Alert.alert('Could not save', res.error || 'Try again');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteJournalEntry(id);
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Journal"
          title="Pages of you."
          subtitle="No streaks, no rules — write when it helps."
        />

        <Button
          title="New entry"
          onPress={() => setModalOpen(true)}
          icon={<Ionicons name="add" size={20} color={Colors.textOnDark} />}
        />

        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>A blank page</Text>
            <Text style={styles.emptyText}>
              Your reflections will live here. Start whenever you're ready.
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: Spacing.xl }}>
            {entries.map((entry) => {
              const date = new Date(entry.createdAtIso);
              return (
                <TouchableOpacity
                  key={entry.id}
                  activeOpacity={0.85}
                  onLongPress={() => handleDelete(entry.id)}
                  style={styles.entryCard}
                >
                  <Text style={styles.entryDate}>
                    {date.toLocaleDateString(undefined, {
                      weekday: 'short', month: 'long', day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  {entry.body ? (
                    <Text style={styles.entryBody} numberOfLines={4}>{entry.body}</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
            <Text style={styles.deleteHint}>Long-press an entry to delete.</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New entry</Text>
              <TouchableOpacity onPress={handleSave} disabled={saving}>
                <Text style={[styles.modalSave, saving && { opacity: 0.4 }]}>
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor={Colors.textMuted}
                style={styles.modalTitleInput}
              />
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="Write freely…"
                placeholderTextColor={Colors.textMuted}
                multiline
                style={styles.modalBodyInput}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    alignItems: 'center', marginTop: Spacing.xxl, paddingHorizontal: Spacing.lg,
  },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: FontSizes.xl, fontFamily: Fonts.display,
    color: Colors.textPrimary, marginBottom: 6,
  },
  emptyText: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textSecondary, textAlign: 'center', lineHeight: 20,
  },
  entryCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.soft,
  },
  entryDate: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.accent, letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 6,
  },
  entryTitle: {
    fontSize: FontSizes.xl, fontFamily: Fonts.display,
    color: Colors.textPrimary, marginBottom: 8, lineHeight: 28,
  },
  entryBody: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textSecondary, lineHeight: 22,
  },
  deleteHint: {
    fontSize: FontSizes.xs, fontFamily: Fonts.body,
    color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalCancel: { fontSize: FontSizes.md, fontFamily: Fonts.body, color: Colors.textSecondary },
  modalSave: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.primary },
  modalTitle: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  modalBody: { padding: Spacing.lg },
  modalTitleInput: {
    fontSize: FontSizes.xxl, fontFamily: Fonts.display,
    color: Colors.textPrimary, marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  modalBodyInput: {
    fontSize: FontSizes.md, fontFamily: Fonts.body,
    color: Colors.textPrimary, lineHeight: 24,
    minHeight: 300, textAlignVertical: 'top',
  },
});