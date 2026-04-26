import { apiGet } from './apiService';

const FALLBACK = [
  "You don't have to have it all figured out today.",
  'Rest is also progress.',
  'Soft is not weak. Slow is not late.',
];

export const getDailyAffirmation = async () => {
  try {
    const data = await apiGet('/api/toolkit/affirmation');
    return data.affirmation || FALLBACK[0];
  } catch {
    return FALLBACK[new Date().getDate() % FALLBACK.length];
  }
};

export const getPersonalizedQuote = async (emotion, userName) => {
  try {
    const params = new URLSearchParams({ emotion });
    if (userName) params.append('userName', userName);
    const data = await apiGet(`/api/toolkit/quotes/ai?${params}`);
    return data.quote || data;
  } catch { return null; }
};