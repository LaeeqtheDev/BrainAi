import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import { Colors, Fonts } from '../config/theme';
import { fScale } from '../config/responsive';

export default function SplashAnimation({ onDone }) {
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('🎬 SplashAnimation mounted');

    Animated.sequence([
      // Ring fades in + scales up
      Animated.parallel([
        Animated.timing(ringOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ringScale, {
          toValue: 1, duration: 700,
          easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
      // Dot pops in
      Animated.spring(dotScale, {
        toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
      }),
      // Title rises + fades in
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleSlide, {
          toValue: 0, duration: 500,
          easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
      // Tagline
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      // Hold
      Animated.delay(900),
    ]).start(() => {
      console.log('🎬 Splash done, calling onDone');
      if (onDone) onDone();
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.markWrap}>
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        <Animated.View style={[styles.dot, { transform: [{ scale: dotScale }] }]} />
      </View>

      <Animated.Text
        style={[
          styles.title,
          { opacity: titleOpacity, transform: [{ translateY: titleSlide }] },
        ]}
      >
        Stillwater
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        a quieter kind of wellness
      </Animated.Text>
    </View>
  );
}

const RING_SIZE = 120;
const DOT_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.accent,
  },
  title: {
    fontSize: fScale(40),
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: fScale(14),
    fontFamily: Fonts.displayItalic,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
});