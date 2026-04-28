import { apiPost, apiGet } from './apiService';
import { auth } from '../config/firebase';

export const MOODS = [
  { key: 'rough',   label: 'Rough',   emoji: '🌧️', value: 2, emotion: 'sad' },
  { key: 'low',     label: 'Low',     emoji: '☁️', value: 4, emotion: 'sad' },
  { key: 'okay',    label: 'Okay',    emoji: '🌤️', value: 5, emotion: 'neutral' },
  { key: 'good',    label: 'Good',    emoji: '🌞', value: 7, emotion: 'happy' },
  { key: 'glowing', label: 'Glowing', emoji: '🌻', value: 9, emotion: 'happy' },
];

export const saveMood = async ({ moodKey, note = '' }) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const mood = MOODS.find((m) => m.key === moodKey);

    const data = await apiPost('/api/mood/log', {
      userId: user.uid,
      emotion: mood?.emotion,
      intensity: mood?.value,
      note,
    });

    return { success: true, id: data.logId };
  } catch (e) {
    console.log('saveMood error:', e.message);
    return { success: false, error: e.message };
  }
};

export const getRecentMoods = async (max = 30) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const data = await apiGet(`/api/mood/history?limit=${max}`);

    return (data || []).map((m) => ({
      id: m.id,
      moodKey: deriveMoodKey(m.emotion, m.intensity),
      note: m.note,
      emotion: m.emotion,
      intensity: m.intensity,
      createdAtIso: m.timestamp,
    }));
  } catch (e) {
    console.log('getRecentMoods error:', e.message);
    return [];
  }
};

export const getMoodAnalytics = async (period = 'week') => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    return await apiGet(`/api/mood/analytics/${user.uid}?period=${period}`);
  } catch {
    return null;
  }
};

export const getMoodStreak = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return { currentStreak: 0, longestStreak: 0 };

    return await apiGet(`/api/mood/streak/${user.uid}`);
  } catch {
    return { currentStreak: 0, longestStreak: 0 };
  }
};

const deriveMoodKey = (emotion, intensity) => {
  if (emotion === 'happy' && intensity >= 8) return 'glowing';
  if (emotion === 'happy') return 'good';
  if (emotion === 'neutral') return 'okay';
  if (emotion === 'sad' && intensity <= 3) return 'rough';
  if (['sad', 'anxious', 'stressed', 'overwhelmed'].includes(emotion)) return 'low';
  return 'okay';
};