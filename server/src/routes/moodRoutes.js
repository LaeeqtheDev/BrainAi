const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { identifyTriggers } = require('../services/triggerAnalysisService');

// POST /api/mood/log - Log mood entry
router.post('/log', async (req, res) => {
  try {
    const { userId, emotion, intensity, note } = req.body;

    if (!userId || !emotion) {
      return res.status(400).json({
        success: false,
        error: 'userId and emotion are required',
      });
    }

    const moodData = {
      userId,
      emotion,
      intensity: intensity || 5,
      note: note || '',
      timestamp: new Date(),
    };

    const docRef = await db.collection('moodLogs').add(moodData);

    console.log(`Mood logged: ${emotion} for user ${userId}`);

    res.json({
      success: true,
      data: {
        logId: docRef.id,
        ...moodData,
      },
    });
  } catch (error) {
    console.error('Mood log error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/mood/history/:userId - Get mood history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30, startDate, endDate } = req.query;

    let query = db
      .collection('moodLogs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));

    if (startDate) {
      query = query.where('timestamp', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('timestamp', '<=', new Date(endDate));
    }

    const snapshot = await query.get();

    const moods = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString(),
    }));

    res.json({
      success: true,
      data: moods,
      count: moods.length,
    });
  } catch (error) {
    console.error('Mood history error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/mood/analytics/:userId - Get mood analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'week' } = req.query; // week, month, all

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
        data: {
          emotionBreakdown: {},
          moodTrends: [],
          totalLogs: 0,
          period,
        },
      });
    }

    const moods = snapshot.docs.map(doc => ({
      emotion: doc.data().emotion,
      intensity: doc.data().intensity || 5,
      timestamp: doc.data().timestamp.toDate(),
    }));

    // Emotion Breakdown
    const emotionCounts = {};
    moods.forEach(mood => {
      emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1;
    });

    // Mood Trends (by day)
    const trendsByDay = {};
    moods.forEach(mood => {
      const day = mood.timestamp.toLocaleDateString('en-US', { weekday: 'short' });
      if (!trendsByDay[day]) {
        trendsByDay[day] = [];
      }
      trendsByDay[day].push(mood.intensity);
    });

    const moodTrends = Object.keys(trendsByDay).map(day => ({
      day,
      avgIntensity: (
        trendsByDay[day].reduce((a, b) => a + b, 0) / trendsByDay[day].length
      ).toFixed(1),
    }));

    // Average Intensity
    const avgIntensity = (
      moods.reduce((sum, mood) => sum + mood.intensity, 0) / moods.length
    ).toFixed(1);

    // Dominant Emotion
    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    res.json({
      success: true,
      data: {
        emotionBreakdown: emotionCounts,
        moodTrends,
        totalLogs: moods.length,
        avgIntensity: parseFloat(avgIntensity),
        dominantEmotion,
        period,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/mood/insights/:userId - AI-generated insights
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period } = req.query; // 'week' or 'month'

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

    // Calculate insights
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

    const avgIntensity = (totalIntensity / moods.length).toFixed(1);
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
          avgIntensity: parseFloat(avgIntensity),
          improvementRate,
          totalLogs: moods.length,
        },
      },
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/mood/streak/:userId - Get mood logging streak
router.get('/streak/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

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

    const logs = snapshot.docs.map(doc => doc.data().timestamp.toDate());

    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if logged today
    const lastLog = logs[0];
    lastLog.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastLog) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) {
      currentStreak = 0; // Streak broken
    } else {
      // Calculate current streak
      for (let i = 0; i < logs.length - 1; i++) {
        const date1 = new Date(logs[i]);
        const date2 = new Date(logs[i + 1]);
        date1.setHours(0, 0, 0, 0);
        date2.setHours(0, 0, 0, 0);

        const diff = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 0; i < logs.length - 1; i++) {
      const date1 = new Date(logs[i]);
      const date2 = new Date(logs[i + 1]);
      date1.setHours(0, 0, 0, 0);
      date2.setHours(0, 0, 0, 0);

      const diff = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 1;
      }
    }

    res.json({
      success: true,
      data: {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        message:
          currentStreak > 0
            ? `You've logged ${currentStreak} day${currentStreak > 1 ? 's' : ''} in a row! 🔥`
            : 'Log your mood today to start a new streak!',
      },
    });
  } catch (error) {
    console.error('Streak error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/mood/triggers/:userId - Identify stress triggers
router.get('/triggers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const analysis = await identifyTriggers(userId);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Triggers error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;