import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Fonts, FontSizes } from '../config/theme';
import { fScale } from '../config/responsive';

export default function SplashAnimation({ onDone }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Ring breathes in
      Animated.parallel([
        Animated.timing(ringOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ringScale, {
          toValue: 1, duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Dot appears in the center of the ring
      Animated.spring(dotScale, {
        toValue: 1, friction: 4, tension: 80, useNativeDriver: true,
      }),
      // Title slides up + fades in
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slide, {
          toValue: 0, duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Tagline fades in
      Animated.timing(taglineFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      // Hold a moment
      Animated.delay(2500),
    ]).start(() => onDone && onDone());

    // Subtle continuous breathing on the ring (loops while splash is up)
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.05, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.markWrap}>
        <Animated.View
          style={[
            styles.ring,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        />
        <Animated.View style={[styles.dot, { transform: [{ scale: dotScale }] }]} />
      </View>

      <Animated.Text
        style={[
          styles.title,
          { opacity: fade, transform: [{ translateY: slide }] },
        ]}
      >
        Stillwater
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
        a quieter kind of wellness
      </Animated.Text>
    </View>
  );
}

const RING_SIZE = fScale(120);
const DOT_SIZE = fScale(20);

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  markWrap: {
    width: RING_SIZE, height: RING_SIZE,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: fScale(32),
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE, height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dot: {
    width: DOT_SIZE, height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.accent,
  },
  title: {
    fontSize: fScale(40),
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: fScale(8),
  },
  tagline: {
    fontSize: fScale(14),
    fontFamily: Fonts.displayItalic,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
});