const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const Groq = require('groq-sdk');
const { verifyToken } = require('../middleware/authMiddleware');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.use(verifyToken);

// GENERATE REPORT
router.get('/generate', async (req, res) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || 'week';

    const days = period === 'month' ? 30 : 7;
    const start = new Date();
    start.setDate(start.getDate() - days);

    const snap = await db
      .collection('moodLogs')
      .where('userId', '==', userId)
      .where('timestamp', '>=', start)
      .get();

    if (snap.empty) {
      return res.json({ success: true, data: { message: 'No data' } });
    }

    const moods = snap.docs.map(d => d.data());

    const counts = {};
    moods.forEach(m => {
      counts[m.emotion] = (counts[m.emotion] || 0) + 1;
    });

    const dominant = Object.keys(counts)[0];

    const ai = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Generate wellness summary' },
        { role: 'user', content: JSON.stringify({ dominant, total: moods.length }) },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    res.json({
      success: true,
      data: {
        summary: ai.choices[0].message.content,
        dominantEmotion: dominant,
        totalLogs: moods.length,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;