import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getHelpSupport } from '../../services/settingsService';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

export default function HelpSupportScreen({ navigation }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getHelpSupport();
      setInfo(data);
      setLoading(false);
    })();
  }, []);

  const openLink = async (url) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
      else Alert.alert("Can't open", url);
    } catch {
      Alert.alert("Can't open", url);
    }
  };

  const contactEmail = () => openLink(`mailto:${info?.contact?.email || 'support@stillwater.app'}?subject=Stillwater%20Support`);
  const contactWhatsApp = () => {
    const num = (info?.contact?.whatsapp || '').replace(/[^\d]/g, '');
    if (num) openLink(`https://wa.me/${num}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScreenHeader eyebrow="Help & support" title="We're here to help." />

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.section}>FAQs</Text>
            <View style={styles.card}>
              {(info?.faqs || []).map((f, i, arr) => {
                const open = openFaq === i;
                return (
                  <View key={i} style={[styles.faq, i === arr.length - 1 && styles.faqLast]}>
                    <TouchableOpacity
                      onPress={() => setOpenFaq(open ? null : i)}
                      style={styles.faqHeader}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.faqQuestion}>{f.question}</Text>
                      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                    {open && <Text style={styles.faqAnswer}>{f.answer}</Text>}
                  </View>
                );
              })}
              {(!info?.faqs || info.faqs.length === 0) && (
                <Text style={styles.empty}>No FAQs yet.</Text>
              )}
            </View>

            <Text style={styles.section}>Reach us</Text>
            <View style={styles.card}>
              <TouchableOpacity onPress={contactEmail} style={styles.row} activeOpacity={0.7}>
                <View style={[styles.icon, { backgroundColor: '#E2EAE3' }]}>
                  <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>Email</Text>
                  <Text style={styles.rowSub}>{info?.contact?.email}</Text>
                </View>
                <Ionicons name="open-outline" size={18} color={Colors.textMuted} />
              </TouchableOpacity>

              {info?.contact?.whatsapp && (
                <TouchableOpacity onPress={contactWhatsApp} style={[styles.row, styles.rowLast]} activeOpacity={0.7}>
                  <View style={[styles.icon, { backgroundColor: '#DCEAE5' }]}>
                    <Ionicons name="logo-whatsapp" size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>WhatsApp</Text>
                    <Text style={styles.rowSub}>{info.contact.whatsapp}</Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('FeedbackForm')}
              style={styles.feedback}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbox-ellipses-outline" size={18} color={Colors.textOnDark} />
              <Text style={styles.feedbackText}>Send feedback in-app</Text>
            </TouchableOpacity>
          </>
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
  section: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, letterSpacing: 1.6,
    textTransform: 'uppercase', marginTop: Spacing.lg, marginBottom: Spacing.sm, marginLeft: 4,
  },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.soft },
  faq: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  faqLast: { borderBottomWidth: 0 },
  faqHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
  },
  faqQuestion: { flex: 1, fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  faqAnswer: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textSecondary, lineHeight: 20,
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  icon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  rowSub: { fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary, marginTop: 2 },
  feedback: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 14,
    borderRadius: Radius.pill, marginTop: Spacing.lg,
  },
  feedbackText: { color: Colors.textOnDark, fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium },
  empty: { padding: Spacing.md, fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center' },
});