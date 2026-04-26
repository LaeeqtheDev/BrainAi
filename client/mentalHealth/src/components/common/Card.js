import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Shadow } from '../../config/theme';

export default function Card({ children, style, muted = false }) {
  return (
    <View
      style={[
        styles.card,
        muted ? styles.muted : styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  elevated: {
    backgroundColor: Colors.surface,
    ...Shadow.soft,
  },
  muted: {
    backgroundColor: Colors.surfaceMuted,
  },
});