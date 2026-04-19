const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// GET /api/reports/:userId/generate - Generate comprehensive wellness report
router.get('/:userId/generate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'week' } = req.query; // 'week' or 'month'

    const daysToFetch = period === 'month' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToFetch);

    // 1. Fetch Mood Logs
    const moodSnapshot = await db
      .collection('moodLogs')
      .where('userId', '==', userId)
      .where('timestamp', '>=', startDate)
      .orderBy('timestamp', 'asc')
      .get();

    // 2. Fetch Journals
    const journalSnapshot = await db
      .collection('journals')
      .where('userId', '==', userId)
      .where('createdAt', '>=', startDate)
      .orderBy('createdAt', 'desc')
      .get();

    // 3. Fetch Wellness Activities (breathing, meditation, etc.)
    // Note: You'd need to track these if you want them in reports
    // For now, we'll use a placeholder

    if (moodSnapshot.empty) {
      return res.json({
        success: true,
        data: {
          message: `No data for the past ${period}. Start logging to generate insights!`,
          period,
          generatedAt: new Date().toISOString(),
        },
      });
    }

    // Process Mood Data
    const moods = moodSnapshot.docs.map(doc => ({
      emotion: doc.data().emotion,
      intensity: doc.data().intensity || 5,
      timestamp: doc.data().timestamp.toDate(),
    }));

    const emotionCounts = {};
    let totalIntensity = 0;

    moods.forEach(mood => {
      emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1;
      totalIntensity += mood.intensity;
    });

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    const avgIntensity = (totalIntensity / moods.length).toFixed(1);

    // Calculate improvement
    let improvementCount = 0;
    moods.forEach((mood, index) => {
      if (index > 0 && mood.intensity > moods[index - 1].intensity) {
        improvementCount++;
      }
    });
    const improvementRate = Math.round((improvementCount / moods.length) * 100);

    // Process Journal Data
    const journalCount = journalSnapshot.size;
    const journalEmotions = {};
    
    journalSnapshot.docs.forEach(doc => {
      const emotion = doc.data().emotionTag;
      if (emotion) {
        journalEmotions[emotion] = (journalEmotions[emotion] || 0) + 1;
      }
    });

    // Get User Info
    const userDoc = await db.collection('users').doc(userId).get();
    const userName = userDoc.exists ? userDoc.data().name : 'User';

    // Generate AI Summary
    let aiSummary = '';
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a compassionate mental health companion. Generate a brief wellness summary (3-4 sentences) based on the user's data. Be encouraging and supportive.`,
          },
          {
            role: 'user',
            content: `Generate a wellness summary for ${userName}. 
Period: ${period}
Dominant emotion: ${dominantEmotion}
Average intensity: ${avgIntensity}/10
Improvement rate: ${improvementRate}%
Journal entries: ${journalCount}
Total mood logs: ${moods.length}`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200,
      });

      aiSummary = completion.choices[0].message.content;
    } catch (aiError) {
      aiSummary = `This ${period}, you logged your mood ${moods.length} times and wrote ${journalCount} journal entries. Your most common emotion was ${dominantEmotion}. Keep up the great work on your mental wellness journey!`;
    }

    // Generate Wellness Advice
    const wellnessAdvice = [];

    if (dominantEmotion === 'stressed' || dominantEmotion === 'anxious') {
      wellnessAdvice.push({
        title: 'Try Stress Relief',
        advice: 'Your logs show elevated stress. Practice breathing exercises daily and consider meditation.',
        action: 'Start with 5 minutes of box breathing',
      });
    }

    if (improvementRate < 30) {
      wellnessAdvice.push({
        title: 'Seek Support',
        advice: 'Your mood hasn\'t improved much. Consider reaching out to a mental health professional.',
        action: 'View crisis resources',
      });
    }

    if (journalCount < 3) {
      wellnessAdvice.push({
        title: 'Journal More',
        advice: 'Journaling helps process emotions. Try writing at least 3 times per week.',
        action: 'Use AI journal prompts',
      });
    }

    if (moods.length < daysToFetch / 2) {
      wellnessAdvice.push({
        title: 'Track Consistently',
        advice: 'Daily mood tracking helps identify patterns. Aim to log your mood every day.',
        action: 'Set a daily reminder',
      });
    }

    if (improvementRate > 60) {
      wellnessAdvice.push({
        title: 'Great Progress!',
        advice: 'Your mood is improving! Keep up your wellness practices.',
        action: 'Celebrate your wins',
      });
    }

    // Build Report
    const report = {
      period,
      generatedAt: new Date().toISOString(),
      userName,
      summary: aiSummary,
      moodStats: {
        totalLogs: moods.length,
        dominantEmotion,
        avgIntensity: parseFloat(avgIntensity),
        improvementRate,
        emotionBreakdown: emotionCounts,
      },
      journalStats: {
        totalEntries: journalCount,
        emotionTags: journalEmotions,
      },
      wellnessAdvice,
      insights: [
        {
          type: improvementRate > 50 ? 'positive' : 'attention',
          message: `Your mood improved ${improvementRate}% this ${period}`,
        },
        {
          type: 'info',
          message: `You logged ${moods.length} moods and wrote ${journalCount} journal entries`,
        },
        {
          type: dominantEmotion === 'happy' || dominantEmotion === 'calm' ? 'positive' : 'neutral',
          message: `Most common emotion: ${dominantEmotion}`,
        },
      ],
    };

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error(' Report generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;