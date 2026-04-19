const axios = require('axios');
const Groq = require('groq-sdk');

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * AI-powered Quranic verse recommendation
 */
async function getVerseByEmotion(emotion) {
  try {
    // Ask AI for verse recommendation
    const messages = [
      {
        role: 'system',
        content: `You are a knowledgeable Islamic scholar helping people find peace through Quranic verses.

For the given emotion, recommend ONE appropriate Quranic verse.

Respond ONLY with valid JSON (no markdown):
{
  "surah": number (1-114),
  "verse": number,
  "theme": "brief theme description",
  "relevance": "why this verse helps with this emotion"
}

Examples:
- Stressed → Surah 94:6 (Relief after hardship)
- Anxious → Surah 2:286 (Allah does not burden)
- Sad → Surah 94:5 (Ease with hardship)`,
      },
      {
        role: 'user',
        content: `Recommend a Quranic verse for someone feeling ${emotion}.`,
      },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150,
    });

    let responseText = completion.choices[0].message.content.trim();
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const aiRecommendation = JSON.parse(responseText);

    // Fetch the actual verse from Quran API
    const response = await axios.get(
      `${QURAN_API_BASE}/ayah/${aiRecommendation.surah}:${aiRecommendation.verse}/editions/en.asad,ar.alafasy`
    );

    const data = response.data.data;
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${
      aiRecommendation.surah * 1000 + aiRecommendation.verse
    }.mp3`;

    return {
      surah: aiRecommendation.surah,
      verse: aiRecommendation.verse,
      theme: aiRecommendation.theme,
      relevance: aiRecommendation.relevance,
      arabic: data[1].text,
      translation: data[0].text,
      surahName: data[0].surah.englishName,
      surahNameArabic: data[0].surah.name,
      audioUrl,
      reciter: 'Mishary Rashid Alafasy',
      source: 'ai-recommended',
    };
  } catch (error) {
    console.error(' AI Quran recommendation error:', error);
    
    // Fallback to hardcoded verse
    return await getFallbackVerse(emotion);
  }
}

/**
 * Fallback verse if AI fails
 */
async function getFallbackVerse(emotion) {
  const fallbacks = {
    stressed: { surah: 94, verse: 6 },
    anxious: { surah: 2, verse: 286 },
    sad: { surah: 94, verse: 5 },
    overwhelmed: { surah: 65, verse: 3 },
    angry: { surah: 41, verse: 34 },
    grateful: { surah: 14, verse: 7 },
    peaceful: { surah: 13, verse: 28 },
    confused: { surah: 20, verse: 114 },
    happy: { surah: 16, verse: 97 },
  };

  const verse = fallbacks[emotion] || fallbacks.peaceful;

  try {
    const response = await axios.get(
      `${QURAN_API_BASE}/ayah/${verse.surah}:${verse.verse}/editions/en.asad,ar.alafasy`
    );

    const data = response.data.data;
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${verse.surah * 1000 + verse.verse}.mp3`;

    return {
      surah: verse.surah,
      verse: verse.verse,
      theme: 'Comfort and peace',
      arabic: data[1].text,
      translation: data[0].text,
      surahName: data[0].surah.englishName,
      surahNameArabic: data[0].surah.name,
      audioUrl,
      reciter: 'Mishary Rashid Alafasy',
      source: 'fallback',
    };
  } catch (error) {
    console.error(' Fallback verse error:', error);
    throw error;
  }
}

/**
 * Get random daily verse (AI-powered)
 */
async function getDailyVerse() {
  try {
    const messages = [
      {
        role: 'system',
        content: `Recommend ONE uplifting Quranic verse for daily reflection.

Respond ONLY with valid JSON:
{
  "surah": number,
  "verse": number,
  "theme": "brief theme"
}`,
      },
      {
        role: 'user',
        content: 'Recommend a Quranic verse for today\'s reflection.',
      },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.9,
      max_tokens: 100,
    });

    let responseText = completion.choices[0].message.content.trim();
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const aiRecommendation = JSON.parse(responseText);

    const response = await axios.get(
      `${QURAN_API_BASE}/ayah/${aiRecommendation.surah}:${aiRecommendation.verse}/editions/en.asad,ar.alafasy`
    );

    const data = response.data.data;
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${
      aiRecommendation.surah * 1000 + aiRecommendation.verse
    }.mp3`;

    return {
      surah: aiRecommendation.surah,
      verse: aiRecommendation.verse,
      theme: aiRecommendation.theme,
      arabic: data[1].text,
      translation: data[0].text,
      surahName: data[0].surah.englishName,
      surahNameArabic: data[0].surah.name,
      audioUrl,
      reciter: 'Mishary Rashid Alafasy',
      type: 'daily-verse',
    };
  } catch (error) {
    console.error(' Daily verse error:', error);
    return await getFallbackVerse('peaceful');
  }
}

module.exports = {
  getVerseByEmotion,
  getDailyVerse,
};