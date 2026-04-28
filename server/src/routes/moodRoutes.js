const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');
const { identifyTriggers } = require('../services/triggerAnalysisService');

router.use(verifyToken); // every route below requires auth

// Map UI mood keys → emotion + intensity for backend storage
const MOOD_KEY_MAP = {
  rough:   { emotion: 'sad',     intensity: 2 },
  low:     { emotion: 'sad',     intensity: 4 },
  okay:    { emotion: 'neutral', intensity: 5 },
  good:    { emotion: 'happy',   intensity: 7 },
  glowing: { emotion: 'happy',   intensity: 9 },
};

// POST /api/mood/log - Log mood entry
router.post('/log', async (req, res) => {
  try {
    const { userId } = req.user;
    let { emotion, intensity, note, moodKey } = req.body;

    // Frontend sends moodKey; map it to emotion + intensity if not given
    if (moodKey && MOOD_KEY_MAP[moodKey]) {
      emotion = emotion || MOOD_KEY_MAP[moodKey].emotion;
      intensity = intensity || MOOD_KEY_MAP[moodKey].intensity;
    }

    if (!emotion) {
      return res.status(400).json({
        success: false,
        error: 'emotion or moodKey required',
      });
    }

    const moodData = {
      userId,
      emotion,
      intensity: intensity || 5,
      moodKey: moodKey || null,
      note: note || '',
      timestamp: new Date(),
    };

    const docRef = await db.collection('moodLogs').add(moodData);
    console.log(`Mood logged: ${emotion} (${intensity}) for user ${userId}`);

    res.json({ success: true, data: { logId: docRef.id, ...moodData } });
  } catch (error) {
    console.error('Mood log error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/mood/history
router.get('/history', async (req, res) => {
  try {
    const { userId } = req.user;
    const limit = parseInt(req.query.limit) || 30;

    const snap = await db.collection('moodLogs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit).get();

    const moods = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp.toDate().toISOString(),
    }));
    res.json({ success: true, data: moods, count: moods.length });
  } catch (e) {
    console.error('Mood history error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/mood/analytics
router.get('/analytics', async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = 'week' } = req.query;

    const daysToFetch = period === 'month' ? 30 : period === 'week' ? 7 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);

    const snapshot = await db
      .collection('moodLogs')
      .where('userId', '==', userId)
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'asc')
      .get();

    if (snapshot.empty) {
      return res.json({
        success: true,
        data: { emotionBreakdown: {}, moodTrends: [], totalLogs: 0, period },
      });
    }

    const moods = snapshot.docs.map(doc => ({
      emotion: doc.data().emotion,
      intensity: doc.data().intensity || 5,
      moodKey: doc.data().moodKey || null,
      timestamp: doc.data().timestamp.toDate(),
    }));

    const emotionCounts = {};
    moods.forEach(mood => {
      emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1;
    });

    const trendsByDay = {};
    moods.forEach(mood => {
      const day = mood.timestamp.toLocaleDateString('en-US', { weekday: 'short' });
      if (!trendsByDay[day]) trendsByDay[day] = [];
      trendsByDay[day].push(mood.intensity);
    });

    const moodTrends = Object.keys(trendsByDay).map(day => ({
      day,
      avgIntensity: +(
        trendsByDay[day].reduce((a, b) => a + b, 0) / trendsByDay[day].length
      ).toFixed(1),
    }));

    const avgIntensity = +(
      moods.reduce((sum, mood) => sum + mood.intensity, 0) / moods.length
    ).toFixed(1);

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    res.json({
      success: true,
      data: {
        emotionBreakdown: emotionCounts,
        moodTrends,
        totalLogs: moods.length,
        avgIntensity,
        dominantEmotion,
        period,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/mood/insights
router.get('/insights', async (req, res) => {
  try {
    const { userId } = req.user;
    const { period } = req.query;

    const daysToFetch = period === 'month' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);

    const snapshot = await db
      .collection('moodLogs')
      .where('userId', '==', userId)
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'asc')
      .get();

    if (snapshot.empty) {
      return res.json({
        success: true,
        data: {
          insights: [],
          message: 'Not enough data yet. Start logging your mood!',
        },
      });
    }

    const moods = snapshot.docs.map(doc => ({
      emotion: doc.data().emotion,
      intensity: doc.data().intensity || 5,
      timestamp: doc.data().timestamp.toDate(),
    }));

    const emotionCounts = {};
    let totalIntensity = 0;
    let improvementCount = 0;

    moods.forEach((mood, index) => {
      emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1;
      totalIntensity += mood.intensity;

      if (index > 0 && mood.intensity > moods[index - 1].intensity) {
        improvementCount++;
      }
    });

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    const avgIntensity = +(totalIntensity / moods.length).toFixed(1);
    const improvementRate = Math.round((improvementCount / moods.length) * 100);

    const insights = [
      {
        type: dominantEmotion === 'happy' || dominantEmotion === 'calm' ? 'positive' : 'attention',
        title: dominantEmotion === 'happy' || dominantEmotion === 'calm'
          ? 'Positive Trend'
          : 'Pattern Detected',
        message: `You felt ${dominantEmotion} most often this ${period || 'week'}. ${
          dominantEmotion === 'stressed'
            ? 'Consider trying breathing exercises.'
            : 'Keep up the great work!'
        }`,
        icon: dominantEmotion === 'happy' ? '😊' : dominantEmotion === 'stressed' ? '😟' : '💭',
      },
      {
        type: improvementRate > 50 ? 'positive' : 'neutral',
        title: improvementRate > 50 ? 'Great Progress!' : 'Stay Consistent',
        message: `Your mood improved ${improvementRate}% this ${period || 'week'}.`,
        icon: improvementRate > 50 ? '📈' : '📊',
      },
      {
        type: 'info',
        title: avgIntensity > 6 ? 'Strong Emotions' : 'Balanced Emotions',
        message: `Your average emotional intensity was ${avgIntensity}/10.`,
        icon: '💪',
      },
    ];

    res.json({
      success: true,
      data: {
        period: period || 'week',
        insights,
        stats: {
          dominantEmotion,
          avgIntensity,
          improvementRate,
          totalLogs: moods.length,
        },
      },
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/mood/streak
router.get('/streak', async (req, res) => {
  try {
    const { userId } = req.user;

    const snapshot = await db
      .collection('moodLogs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    if (snapshot.empty) {
      return res.json({
        success: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          message: 'Start logging your mood to build a streak!',
        },
      });
    }

    // Dedupe to one entry per day, sorted desc
    const dayTimestamps = [...new Set(snapshot.docs.map((d) => {
      const dt = d.data().timestamp.toDate();
      dt.setHours(0, 0, 0, 0);
      return dt.getTime();
    }))].sort((a, b) => b - a);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const ONE_DAY = 86400000;

    let currentStreak = 0;
    if (dayTimestamps[0] === today.getTime() || dayTimestamps[0] === today.getTime() - ONE_DAY) {
      currentStreak = 1;
      for (let i = 0; i < dayTimestamps.length - 1; i++) {
        if (dayTimestamps[i] - dayTimestamps[i + 1] === ONE_DAY) currentStreak++;
        else break;
      }
    }

    let longestStreak = 1;
    let temp = 1;
    for (let i = 0; i < dayTimestamps.length - 1; i++) {
      if (dayTimestamps[i] - dayTimestamps[i + 1] === ONE_DAY) {
        temp++;
        longestStreak = Math.max(longestStreak, temp);
      } else {
        temp = 1;
      }
    }

    res.json({
      success: true,
      data: {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        message: currentStreak > 0
          ? `You've logged ${currentStreak} day${currentStreak > 1 ? 's' : ''} in a row! 🔥`
          : 'Log your mood today to start a new streak!',
      },
    });
  } catch (error) {
    console.error('Streak error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/mood/triggers
router.get('/triggers', async (req, res) => {
  try {
    const { userId } = req.user;
    const analysis = await identifyTriggers(userId);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Triggers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;