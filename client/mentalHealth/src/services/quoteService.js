import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet } from './apiService';

const KEY = 'cachedAffirmation';

const FALLBACK = [
  "You don't have to have it all figured out today.",
  'Rest is also progress.',
  'Soft is not weak. Slow is not late.',
  'You are allowed to take up space.',
  'A small kindness to yourself counts.',
  "Whatever you feel right now is allowed to be here.",
  'Peace begins the moment you stop arguing with reality.',
];

// Returns the most recently cached affirmation immediately.
// If nothing is cached yet (first ever app open), returns a random fallback.
export const getCachedAffirmation = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return raw;
  } catch {}
  return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
};

// Fetches a fresh affirmation from the backend and caches it.
// Returns null on failure so the caller can keep the cached value.
export const getDailyAffirmation = async () => {
  try {
    const data = await apiGet('/api/toolkit/affirmation');
    const text = data?.affirmation;
    if (text) {
      await AsyncStorage.setItem(KEY, text);
      return text;
    }
    return null;
  } catch (err) {
    console.log('❌ Affirmation fetch failed:', err.message);
    return null;
  }
};

export const getPersonalizedQuote = async (emotion, userName) => {
  try {
    const params = new URLSearchParams({ emotion });
    if (userName) params.append('userName', userName);
    const data = await apiGet(`/api/toolkit/quotes/ai?${params}`);
    return {
      quote: data.quote,
      emoji: data.emoji,
      category: data.category,
    };
  } catch (err) {
    console.log('❌ Personalized quote fetch failed:', err.message);
    return null;
  }
};