const express = require('express');
const router = express.Router();
const { getVerseByEmotion, getDailyVerse, getVersesByCategory } = require('../services/quranService');

// GET /api/quran/verse/:emotion
router.get('/verse/:emotion', async (req, res) => {
  try {
    const { emotion } = req.params;
    const verse = await getVerseByEmotion(emotion);
    
    res.json({
      success: true,
      data: verse,
    });
  } catch (error) {
    console.error(' Quran verse error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/quran/daily
router.get('/daily', async (req, res) => {
  try {
    const verse = await getDailyVerse();
    
    res.json({
      success: true,
      data: verse,
    });
  } catch (error) {
    console.error(' Daily verse error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/quran/category/:category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const verses = await getVersesByCategory(category);
    
    res.json({
      success: true,
      data: verses,
      count: verses.length,
    });
  } catch (error) {
    console.error(' Category verses error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;