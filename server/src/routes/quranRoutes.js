const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getVerseByEmotion, getDailyVerse, getVersesByCategory,
} = require('../services/quranService');

// Public: verse-by-emotion, daily, category
router.get('/verse/:emotion', async (req, res) => {
  try {
    const verse = await getVerseByEmotion(req.params.emotion);
    res.json({ success: true, data: verse });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/daily', async (req, res) => {
  try {
    const verse = await getDailyVerse();
    res.json({ success: true, data: verse });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const verses = await getVersesByCategory(req.params.category);
    res.json({ success: true, data: verses, count: verses.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Protected: favorites
router.use(verifyToken);

// GET /api/quran/favorites — list user's favorites
router.get('/favorites', async (req, res) => {
  try {
    const { userId } = req.user;
    const snap = await db.collection('users').doc(userId)
      .collection('favoriteVerses').orderBy('savedAt', 'desc').get();

    const favorites = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ success: true, data: favorites });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/quran/favorites — toggle favorite
router.post('/favorites', async (req, res) => {
  try {
    const { userId } = req.user;
    const { verseId, verseData } = req.body;
    if (!verseId) return res.status(400).json({ success: false, error: 'verseId required' });

    const ref = db.collection('users').doc(userId).collection('favoriteVerses').doc(verseId);
    const existing = await ref.get();

    if (existing.exists) {
      await ref.delete();
      return res.json({ success: true, action: 'removed', verseId });
    } else {
      await ref.set({
        verseId,
        ...verseData,
        savedAt: new Date(),
      });
      return res.json({ success: true, action: 'added', verseId });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;