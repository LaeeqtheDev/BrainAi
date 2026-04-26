import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BREATHING_PATTERNS } from '../../data/breathingPatters';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Colors, Spacing, Fonts, FontSizes, Radius, Shadow } from '../../config/theme';

export default function BreathingScreen({ navigation }) {
  const [patternKey, setPatternKey] = useState('box');
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('Ready');
  const [cycleCount, setCycleCount] = useState(0);

  const scale = useRef(new Animated.Value(0.7)).current;
  const animationRef = useRef(null);
  const stoppedRef = useRef(false);

  const pattern = BREATHING_PATTERNS.find((p) => p.key === patternKey);

  const runCycle = () => {
    if (stoppedRef.current) return;

    const animations = pattern.cycle.map((step) =>
      Animated.timing(scale, {
        toValue: step.scaleTo,
        duration: step.duration,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      })
    );

    let stepIdx = 0;
    const runStep = () => {
      if (stoppedRef.current) return;
      setPhase(pattern.cycle[stepIdx].phase);
      animations[stepIdx].start(({ finished }) => {
        if (!finished || stoppedRef.current) return;
        stepIdx++;
        if (stepIdx < animations.length) {
          runStep();
        } else {
          setCycleCount((c) => c + 1);
          runCycle(); // loop
        }
      });
    };
    runStep();
  };

  const start = () => {
    stoppedRef.current = false;
    setRunning(true);
    setCycleCount(0);
    runCycle();
  };

  const stop = () => {
    stoppedRef.current = true;
    setRunning(false);
    setPhase('Ready');
    scale.stopAnimation();
    Animated.timing(scale, { toValue: 0.7, duration: 400, useNativeDriver: true }).start();
  };

  useEffect(() => {
    return () => { stoppedRef.current = true; };
  }, []);

  // Switch pattern
  const switchPattern = (key) => {
    if (running) stop();
    setPatternKey(key);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScreenHeader
          eyebrow="Self-help · Breathing"
          title="Breathe with me."
          subtitle="A few minutes can shift everything."
        />

        {/* Pattern tabs */}
        <View style={styles.tabs}>
          {BREATHING_PATTERNS.map((p) => {
            const active = p.key === patternKey;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => switchPattern(p.key)}
                style={[styles.tab, active && styles.tabActive]}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.description}>{pattern.description}</Text>

        {/* Animated circle */}
        <View style={styles.circleWrap}>
          <Animated.View
            style={[
              styles.outerRing,
              { transform: [{ scale: scale.interpolate({
                inputRange: [0.7, 1.3], outputRange: [0.85, 1.15],
              }) }] },
            ]}
          />
          <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
            <Text style={styles.phase}>{phase}</Text>
          </Animated.View>
        </View>

        <Text style={styles.cycleText}>
          {running ? `Cycle ${cycleCount + 1}` : 'Tap start when you\'re ready'}
        </Text>

        <View style={styles.controls}>
          {!running ? (
            <TouchableOpacity onPress={start} style={styles.startBtn} activeOpacity={0.85}>
              <Ionicons name="play" size={20} color={Colors.textOnDark} />
              <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={stop} style={styles.stopBtn} activeOpacity={0.85}>
              <Ionicons name="stop" size={20} color={Colors.primary} />
              <Text style={styles.stopText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={Colors.accent} />
          <Text style={styles.tipText}>
            Practice for 2–5 minutes when you feel overwhelmed or anxious.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CIRCLE_SIZE = 220;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  headerRow: { paddingTop: Spacing.md, marginBottom: Spacing.md },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  tabs: {
    flexDirection: 'row', gap: 8, marginBottom: Spacing.md,
  },
  tab: {
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1, borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: FontSizes.sm, fontFamily: Fonts.bodyMedium, color: Colors.textPrimary },
  tabTextActive: { color: Colors.textOnDark },
  description: {
    fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textSecondary, marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  circleWrap: {
    alignItems: 'center', justifyContent: 'center',
    marginVertical: Spacing.xl, height: CIRCLE_SIZE + 60,
  },
  outerRing: {
    position: 'absolute',
    width: CIRCLE_SIZE + 60, height: CIRCLE_SIZE + 60,
    borderRadius: (CIRCLE_SIZE + 60) / 2,
    backgroundColor: '#E2EAE3', opacity: 0.5,
  },
  circle: {
    width: CIRCLE_SIZE, height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  phase: {
    fontSize: FontSizes.xl, fontFamily: Fonts.display,
    color: Colors.textOnDark, letterSpacing: 0.5,
  },
  cycleText: {
    textAlign: 'center', fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textSecondary, marginBottom: Spacing.lg,
  },
  controls: { alignItems: 'center', marginBottom: Spacing.xl },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: Radius.pill,
  },
  startText: { color: Colors.textOnDark, fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium },
  stopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.borderStrong,
    paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: Radius.pill,
  },
  stopText: { color: Colors.primary, fontSize: FontSizes.md, fontFamily: Fonts.bodyMedium },
  tipCard: {
    flexDirection: 'row', gap: 10, alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    padding: Spacing.md, borderRadius: Radius.md,
  },
  tipText: {
    flex: 1, fontSize: FontSizes.sm, fontFamily: Fonts.body,
    color: Colors.textSecondary, lineHeight: 20,
  },
});