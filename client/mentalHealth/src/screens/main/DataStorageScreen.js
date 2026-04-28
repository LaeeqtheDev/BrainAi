import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { exportData, deleteAccount } from '../../services/settingsService';
import { signOut } from '../../services/authService';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

export default function DataStorageScreen({ navigation }) {
  const [stats, setStats] = useState({ moods: 0, journals: 0, chats: 0 });
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await exportData();
      if (data) {
        setStats({
          moods: (data.moodLogs || []).length,
          journals: (data.journals || []).length,
          chats: (data.chats || []).length,
        });
      }
    })();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    const data = await exportData();
    setExporting(false);
    if (!data) return Alert.alert('Export failed', 'Could not gather your data.');

    try {
      const json = JSON.stringify(data, null, 2);
      await Share.share({
        message: json,
        title: 'My Stillwater Data',
      });
    } catch {
      Alert.alert('Could not share', 'Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete account?',
      'This will permanently erase your moods, journal, chats, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const res = await deleteAccount();
            setDeleting(false);
            if (res.success) {
              await signOut(); // AppNavigator will route to Auth stack
            } else {
              Alert.alert('Could not delete', res.error || 'Try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScreenHeader
          eyebrow="Data & storage"
          title="Your data, your call."
          subtitle="Export it. Delete it. It's yours."
        />

        <View style={styles.statsRow}>
          <Stat label="Mood logs" value={stats.moods} />
          <Stat label="Journal" value={stats.journals} />
          <Stat label="Chats" value={stats.chats} />
        </View>

        <TouchableOpacity onPress={handleExport} disabled={exporting} style={styles.actionCard} activeOpacity={0.85}>
          <View style={[styles.actionIcon, { backgroundColor: '#E2EAE3' }]}>
            <Ionicons name="download-outline" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Export my data</Text>
            <Text style={styles.actionSub}>JSON file via your share sheet</Text>
          </View>
          {exporting ? <ActivityIndicator color={Colors.primary} /> : <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete} disabled={deleting} style={[styles.actionCard, styles.danger]} activeOpacity={0.85}>
          <View style={[styles.actionIcon, { backgroundColor: '#FBE9E5' }]}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionTitle, { color: Colors.error }]}>Delete account</Text>
            <Text style={styles.actionSub}>Permanently erase everything</Text>
          </View>
          {deleting ? <ActivityIndicator color={Colors.error} /> : <Ionicons name="chevron-forward" size={18} color={Colors.error} />}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  statBox: {
    flex: 1, backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center',
  },
  statValue: { fontSize: 28, fontFamily: Fonts.display, color: Colors.primary, marginBottom: 4 },
  statLabel: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, letterSpacing: 1.2, textTransform: 'uppercase',
  },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.soft,
  },
  danger: { backgroundColor: '#FFF8F6' },
  actionIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  actionSub: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
});