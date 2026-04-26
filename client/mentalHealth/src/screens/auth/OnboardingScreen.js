import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSizes, Fonts, Shadow } from '../../config/theme';

const PILLARS = [
  {
    icon: 'sparkles-outline',
    tint: '#EFE6D6',
    title: 'Notice the small things',
    text: 'A gentle daily check-in that becomes a quiet ritual.',
  },
  {
    icon: 'book-outline',
    tint: '#E2EAE3',
    title: 'Write without pressure',
    text: 'Private journaling, just for you. No streaks. No guilt.',
  },
  {
    icon: 'leaf-outline',
    tint: '#F5DECF',
    title: 'See your weather',
    text: 'Patterns in your mood become visible, not overwhelming.',
  },
];

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <View style={styles.brandDot} />
          </View>
          <Text style={styles.brandName}>Stillwater</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>A quieter kind of wellness app</Text>
          <Text style={styles.title}>
            Be with{'\n'}
            <Text style={styles.titleItalic}>yourself,</Text>{'\n'}
            gently.
          </Text>
          <Text style={styles.subtitle}>
            Stillwater is a soft place for your moods, thoughts, and small reflections — kept private, paced by you.
          </Text>
        </View>

        <View style={styles.pillars}>
          {PILLARS.map((p, i) => (
            <View key={i} style={styles.pillar}>
              <View style={[styles.pillarIcon, { backgroundColor: p.tint }]}>
                <Ionicons name={p.icon} size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pillarTitle}>{p.title}</Text>
                <Text style={styles.pillarText}>{p.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.cta}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.ctaText}>Begin</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textOnDark} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already here? <Text style={styles.loginTextBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: Spacing.xl,
  },
  brandMark: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  brandDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  brandName: {
    fontSize: FontSizes.lg, fontFamily: Fonts.display,
    color: Colors.primary, letterSpacing: 0.5,
  },
  hero: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  eyebrow: {
    fontSize: FontSizes.xs, fontFamily: Fonts.bodyMedium,
    color: Colors.accent, letterSpacing: 1.8,
    textTransform: 'uppercase', marginBottom: Spacing.md,
  },
  title: {
    fontSize: 52, fontFamily: Fonts.display, color: Colors.textPrimary,
    lineHeight: 58, letterSpacing: -1,
  },
  titleItalic: {
    fontFamily: Fonts.displayItalic, color: Colors.accent,
  },
  subtitle: {
    fontSize: FontSizes.md, fontFamily: Fonts.body,
    color: Colors.textSecondary, marginTop: Spacing.md,
    lineHeight: 24,
  },
  pillars: { marginBottom: Spacing.xl, gap: Spacing.md },
  pillar: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    ...Shadow.soft,
  },
  pillarIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  pillarTitle: {
    fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium,
    color: Colors.textPrimary, marginBottom: 2,
  },
  pillarText: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textSecondary, lineHeight: 20,
  },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary,
    paddingVertical: 18, borderRadius: Radius.pill,
    marginBottom: Spacing.md,
  },
  ctaText: {
    fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium,
    color: Colors.textOnDark, letterSpacing: 0.5,
  },
  loginLink: { alignItems: 'center', paddingVertical: Spacing.sm },
  loginText: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body, color: Colors.textSecondary,
  },
  loginTextBold: { fontFamily: Fonts.bodyMedium, color: Colors.primary },
});