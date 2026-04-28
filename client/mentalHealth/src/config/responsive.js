import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Baseline: iPhone 13 / Pixel 7 width = 390dp
const BASELINE_WIDTH = 390;

// Scale a dimension proportionally to screen width, capped to keep tablets sane
export const scale = (size) => {
  const ratio = SCREEN_W / BASELINE_WIDTH;
  const capped = Math.min(Math.max(ratio, 0.85), 1.15); // never shrink below 85% or grow past 115%
  return Math.round(PixelRatio.roundToNearestPixel(size * capped));
};

// Vertical scale (less aggressive — heights vary more)
export const vScale = (size) => {
  const ratio = SCREEN_H / 844;
  const capped = Math.min(Math.max(ratio, 0.9), 1.1);
  return Math.round(PixelRatio.roundToNearestPixel(size * capped));
};

// Font scale — respects user's system font size preference but caps growth
export const fScale = (size) => {
  const scaled = scale(size);
  return scaled;
};

export const isSmallPhone = SCREEN_W < 360;
export const isLargePhone = SCREEN_W >= 414;
export const isTablet = SCREEN_W >= 600;

export const SCREEN_WIDTH = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;