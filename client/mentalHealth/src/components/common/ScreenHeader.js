import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, Fonts } from '../../config/theme';

export default function ScreenHeader({ eyebrow, title, subtitle }) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.lg },
  eyebrow: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.bodyMedium,
    color: Colors.accent,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: FontSizes.display,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
  },
});