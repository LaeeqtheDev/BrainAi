import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLock } from '../context/LockContext';
import { Colors, Spacing, Fonts, FontSizes, Radius } from '../config/theme';

export default function LockScreen() {
  const { unlock, unlocking } = useLock();

  useEffect(() => { unlock(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="lock-closed" size={48} color={Colors.primary} />
      </View>
      <Text style={styles.title}>Stillwater</Text>
      <Text style={styles.subtitle}>This space is locked.</Text>

      <TouchableOpacity onPress={unlock} disabled={unlocking} style={styles.btn}>
        {unlocking ? (
          <ActivityIndicator color={Colors.textOnDark} />
        ) : (
          <>
            <Ionicons name="finger-print" size={18} color={Colors.textOnDark} />
            <Text style={styles.btnText}>Unlock</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center', padding: Spacing.lg,
  },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  title: { fontSize: 36, fontFamily: Fonts.display, color: Colors.textPrimary },
  subtitle: { fontSize: FontSizes.md, fontFamily: Fonts.displayItalic, color: Colors.textSecondary, marginTop: 8, marginBottom: Spacing.xxl },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: Radius.pill,
  },
  btnText: { color: Colors.textOnDark, fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium },
});