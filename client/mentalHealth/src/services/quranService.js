import { apiGet, apiPost } from './apiService';

export const getDailyVerse = async () => {
  try { return await apiGet('/api/quran/daily'); }
  catch { return null; }
};

export const getVersesByCategory = async (category = 'all') => {
  try {
    const data = await apiGet(`/api/quran/category/${category}`);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.log('verses fetch error:', e.message);
    return [];
  }
};

export const getFavoriteVerses = async () => {
  try {
    const data = await apiGet('/api/quran/favorites');
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};

export const toggleFavoriteVerse = async (verse) => {
  try {
    const result = await apiPost('/api/quran/favorites', {
      verseId: verse.id,
      verseData: {
        tag: verse.tag,
        category: verse.category,
        surah: verse.surah,
        verse: verse.verse,
        arabic: verse.arabic,
        translation: verse.translation,
        reference: verse.reference,
        audioUrl: verse.audioUrl,
      },
    });
    return { success: true, action: result.action };
  } catch (e) {
    return { success: false, error: e.message };
  }
};