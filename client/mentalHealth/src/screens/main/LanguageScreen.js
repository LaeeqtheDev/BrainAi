import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getMe, updateLanguage } from '../../services/settingsService';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

const LANGUAGES = [
  { key: 'English', native: 'English', sub: 'Default' },
  { key: 'Urdu', native: 'اُردُو', sub: 'Coming soon — UI translations in progress' },
];

export default function LanguageScreen({ navigation }) {
  const [current, setCurrent] = useState('English');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (me?.settings?.general?.language) setCurrent(me.settings.general.language);
      setLoading(false);
    })();
  }, []);

  const choose = async (lang) => {
    setCurrent(lang);
    await updateLanguage(lang);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScreenHeader eyebrow="Language" title="Choose your language." />

        <View style={styles.card}>
          {LANGUAGES.map((l, i) => {
            const active = current === l.key;
            return (
              <TouchableOpacity
                key={l.key}
                onPress={() => choose(l.key)}
                style={[styles.row, i === LANGUAGES.length - 1 && styles.rowLast]}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.native}>{l.native}</Text>
                  <Text style={styles.sub}>{l.sub}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
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
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.soft },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  native: { fontSize: FontSizes.lg, fontFamily: Fonts.display, color: Colors.textPrimary },
  sub: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
});