import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '../config/theme';

// data: [{ label, value, emoji }]
export default function EmotionBarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.wrap}>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <View key={d.label} style={styles.row}>
            <Text style={styles.emoji}>{d.emoji}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.value}>{d.value}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  emoji: { fontSize: 22, width: 28 },
  barTrack: {
    flex: 1, height: 12, borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceMuted, overflow: 'hidden',
  },
  barFill: {
    height: '100%', backgroundColor: Colors.primarySoft,
    borderRadius: Radius.pill,
  },
  value: {
    fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary, width: 24, textAlign: 'right',
  },
});