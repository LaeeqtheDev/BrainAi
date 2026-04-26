import { apiGet } from './apiService';

export const getDailyVerse = async () => {
  try { return await apiGet('/api/quran/daily'); }
  catch { return null; }
};

export const getVerseByEmotion = async (emotion) => {
  try { return await apiGet(`/api/quran/verse/${emotion}`); }
  catch { return null; }
};

export const getVersesByCategory = async (category) => {
  try { return await apiGet(`/api/quran/category/${category}`); }
  catch { return null; }
};