import { apiPost, apiGet } from './apiService';

export const MOODS = [
  { key: 'rough',   label: 'Rough',   emoji: '🌧️', value: 1 },
  { key: 'low',     label: 'Low',     emoji: '☁️', value: 2 },
  { key: 'okay',    label: 'Okay',    emoji: '🌤️', value: 3 },
  { key: 'good',    label: 'Good',    emoji: '🌞', value: 4 },
  { key: 'glowing', label: 'Glowing', emoji: '🌻', value: 5 },
];

export const saveMood = async ({ moodKey, note = '' }) => {
  try {
    const data = await apiPost('/api/mood/log', { moodKey, note });
    return { success: true, id: data.logId };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const getRecentMoods = async (max = 30) => {
  try {
    const data = await apiGet(`/api/mood/history?limit=${max}`);
    // Map backend shape → frontend shape (preserve moodKey if present)
    return (data || []).map((m) => ({
      id: m.id,
      moodKey: m.moodKey || deriveMoodKey(m.emotion, m.intensity),
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
    return await apiGet(`/api/mood/analytics?period=${period}`);
  } catch { return null; }
};

export const getMoodStreak = async () => {
  try { return await apiGet('/api/mood/streak'); }
  catch { return { currentStreak: 0, longestStreak: 0 }; }
};

const deriveMoodKey = (emotion, intensity) => {
  if (emotion === 'happy' && intensity >= 8) return 'glowing';
  if (emotion === 'happy') return 'good';
  if (emotion === 'neutral') return 'okay';
  if (emotion === 'sad' && intensity <= 3) return 'rough';
  if (['sad', 'anxious', 'stressed', 'overwhelmed'].includes(emotion)) return 'low';
  return 'okay';
};