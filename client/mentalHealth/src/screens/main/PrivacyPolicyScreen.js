import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getPrivacyPolicy } from '../../services/settingsService';
import { Colors, Spacing, Fonts, FontSizes, Radius } from '../../config/theme';

export default function PrivacyPolicyScreen({ navigation }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getPrivacyPolicy();
      setPolicy(data);
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} />
        ) : policy ? (
          <>
            <Text style={styles.eyebrow}>Last updated · {policy.lastUpdated}</Text>
            <Text style={styles.title}>{policy.title}</Text>

            {(policy.sections || []).map((s, i) => (
              <View key={i} style={styles.section}>
                <Text style={styles.heading}>{s.heading}</Text>
                <Text style={styles.body}>{s.body}</Text>
              </View>
            ))}

            {/* Old shape fallback */}
            {policy.content && !policy.sections && (
              <Text style={styles.body}>{policy.content}</Text>
            )}
          </>
        ) : (
          <Text style={styles.empty}>Could not load privacy policy.</Text>
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
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  eyebrow: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.accent, letterSpacing: 1.6,
    textTransform: 'uppercase', marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 36, fontFamily: Fonts.display,
    color: Colors.textPrimary, marginBottom: Spacing.xl, lineHeight: 42,
  },
  section: { marginBottom: Spacing.lg },
  heading: {
    fontSize: FontSizes.lg, fontFamily: Fonts.display,
    color: Colors.textPrimary, marginBottom: 8,
  },
  body: {
    fontSize: FontSizes.md, fontFamily: Fonts.body,
    color: Colors.textSecondary, lineHeight: 24,
  },
  empty: { fontSize: FontSizes.md, color: Colors.textMuted, textAlign: 'center', marginTop: 80 },
});