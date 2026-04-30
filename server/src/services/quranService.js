const axios = require('axios');

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

const CATEGORY_VERSES = {
  stress: [
    { id: 'baqarah-286', surah: 2, verse: 286, tag: 'Relief from Burden' },
    { id: 'rad-28', surah: 13, verse: 28, tag: 'Peace & Tranquility' },
    { id: 'baqarah-153', surah: 2, verse: 153, tag: 'Patience' },
  ],
  hope: [
    { id: 'sharh-5', surah: 94, verse: 5, tag: 'Hope & Ease' },
    { id: 'sharh-6', surah: 94, verse: 6, tag: 'Hope & Ease' },
    { id: 'talaq-3', surah: 65, verse: 3, tag: 'Trust in Allah' },
    { id: 'zumar-53', surah: 39, verse: 53, tag: 'Mercy' },
  ],
  patience: [
    { id: 'baqarah-153b', surah: 2, verse: 153, tag: 'Patience' },
    { id: 'baqarah-216', surah: 2, verse: 216, tag: 'Wisdom' },
  ],
  peace: [
    { id: 'fajr-27', surah: 89, verse: 27, tag: 'Inner Peace' },
    { id: 'rad-28b', surah: 13, verse: 28, tag: 'Heart at Rest' },
  ],
};

CATEGORY_VERSES.all = (() => {
  const seen = new Set();
  const out = [];
  Object.keys(CATEGORY_VERSES).forEach((cat) => {
    if (cat === 'all') return;
    CATEGORY_VERSES[cat].forEach((v) => {
      const key = `${v.surah}:${v.verse}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(v);
      }
    });
  });
  return out;
})();

const audioForAyah = (surah, verse) => {
  const s = String(surah).padStart(3, '0');
  const v = String(verse).padStart(3, '0');
  return `https://everyayah.com/data/Alafasy_128kbps/${s}${v}.mp3`;
};

const findCategoryFor = (id) => {
  for (const cat of Object.keys(CATEGORY_VERSES)) {
    if (cat === 'all') continue;
    if (CATEGORY_VERSES[cat].some((v) => v.id === id)) return cat;
  }
  return 'all';
};

async function fetchVerseDetails(ref) {
  try {
    const r = await axios.get(
      `${QURAN_API_BASE}/ayah/${ref.surah}:${ref.verse}/editions/en.asad,ar.alafasy`,
      { timeout: 8000 }
    );
    const data = r.data.data;
    const englishData = data[0];
    const arabicData = data[1];

    return {
      id: ref.id,
      tag: ref.tag,
      category: findCategoryFor(ref.id),
      surah: ref.surah,
      verse: ref.verse,
      arabic: arabicData.text,
      translation: englishData.text,
      reference: `Surah ${englishData.surah.englishName} (${ref.surah}:${ref.verse})`,
      surahName: englishData.surah.englishName,
      audioUrl: audioForAyah(ref.surah, ref.verse),
      reciter: 'Mishary Rashid Alafasy',
    };
  } catch (e) {
    console.error(`Failed to fetch ${ref.surah}:${ref.verse}:`, e.message);
    return null;
  }
}

async function getVersesByCategory(category) {
  const refs = CATEGORY_VERSES[category] || CATEGORY_VERSES.all;
  if (!refs.length) return [];
  const results = await Promise.all(refs.map(fetchVerseDetails));
  return results.filter(Boolean);
}

async function getVerseByEmotion(emotion) {
  const map = {
    stressed: 'stress',
    anxious: 'stress',
    overwhelmed: 'stress',
    sad: 'hope',
    happy: 'hope',
    peaceful: 'peace',
    calm: 'peace',
    angry: 'patience',
    frustrated: 'patience',
  };
  const category = map[emotion] || 'all';
  const verses = await getVersesByCategory(category);
  return verses[0] || null;
}

async function getDailyVerse() {
  const all = await getVersesByCategory('all');
  if (!all.length) return null;
  const dayIndex = Math.floor(Date.now() / 86400000) % all.length;
  return all[dayIndex];
}

module.exports = {
  getVerseByEmotion,
  getDailyVerse,
  getVersesByCategory,
};