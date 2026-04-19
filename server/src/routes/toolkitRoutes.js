const express = require('express');
const router = express.Router();
const { generatePersonalizedQuote, generateDailyAffirmation } = require('../services/aiQuotesService');

// GET /api/toolkit/breathing
router.get('/breathing', (req, res) => {
  const exercises = [
    {
      id: 'box-breathing',
      name: 'Box Breathing',
      description: 'Follow the circle. Breathe in for 4 seconds, hold for 4, breathe out for 4.',
      duration: 4,
      steps: ['Breathe In', 'Hold', 'Breathe Out', 'Hold'],
      tip: 'Practice this for 2-5 minutes when you feel overwhelmed or anxious.',
    },
    {
      id: '4-7-8-breathing',
      name: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8. Calming technique.',
      duration: { in: 4, hold: 7, out: 8 },
      steps: ['Breathe In (4s)', 'Hold (7s)', 'Breathe Out (8s)'],
      tip: 'Great for reducing anxiety and helping you fall asleep.',
    },
  ];

  res.json({
    success: true,
    data: exercises,
  });
});

// GET /api/toolkit/meditation
router.get('/meditation', (req, res) => {
  const meditations = [
    {
      id: 'body-scan',
      name: 'Body Scan Meditation',
      duration: 10,
      description: 'Relax each part of your body from head to toe.',
      steps: [
        'Find a comfortable position',
        'Close your eyes and take 3 deep breaths',
        'Focus on your head and neck, release tension',
        'Move down to shoulders and arms',
        'Continue through your entire body',
        'Rest in stillness for a few moments',
      ],
    },
    {
      id: 'mindful-breathing',
      name: 'Mindful Breathing',
      duration: 5,
      description: 'Focus on your natural breath without changing it.',
      steps: [
        'Sit comfortably with eyes closed',
        'Notice your breath flowing in and out',
        'When your mind wanders, gently return focus',
        'Continue for 5 minutes',
      ],
    },
  ];

  res.json({
    success: true,
    data: meditations,
  });
});

// GET /api/toolkit/quotes (Static quotes)
router.get('/quotes', (req, res) => {
  const quotes = [
    {
      id: 1,
      text: 'Every moment is a fresh beginning.',
      author: 'T.S. Eliot',
      category: 'inspiration',
      emoji: '🌟',
    },
    {
      id: 2,
      text: 'You are stronger than you think.',
      author: 'Unknown',
      category: 'motivation',
      emoji: '💪',
    },
    {
      id: 3,
      text: 'Peace comes from within. Do not seek it without.',
      author: 'Buddha',
      category: 'peace',
      emoji: '🕊️',
    },
    {
      id: 4,
      text: 'The only way out is through.',
      author: 'Robert Frost',
      category: 'resilience',
      emoji: '🌿',
    },
    {
      id: 5,
      text: 'Be gentle with yourself. You are doing the best you can.',
      author: 'Unknown',
      category: 'self-compassion',
      emoji: '💖',
    },
  ];

  const random = req.query.random === 'true';
  
  res.json({
    success: true,
    data: random ? quotes[Math.floor(Math.random() * quotes.length)] : quotes,
    type: 'static',
  });
});

// ✨ NEW: GET /api/toolkit/quotes/ai - AI-Generated Personalized Quote
router.get('/quotes/ai', async (req, res) => {
  try {
    const { emotion, userName, context } = req.query;

    if (!emotion) {
      return res.status(400).json({
        success: false,
        error: 'emotion query parameter required (e.g., ?emotion=stressed)',
      });
    }

    const quote = await generatePersonalizedQuote(emotion, userName, context);

    res.json({
      success: true,
      data: quote,
      type: 'ai-generated',
    });
  } catch (error) {
    console.error(' AI quote error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ✨ NEW: GET /api/toolkit/affirmation - Daily AI Affirmation
router.get('/affirmation', async (req, res) => {
  try {
    const affirmation = await generateDailyAffirmation();

    res.json({
      success: true,
      data: affirmation,
    });
  } catch (error) {
    console.error(' Affirmation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/toolkit/gratitude
router.get('/gratitude', (req, res) => {
  const prompts = [
    {
      id: 1,
      question: 'What made you smile today?',
      category: 'daily',
    },
    {
      id: 2,
      question: 'Who are you grateful for and why?',
      category: 'relationships',
    },
    {
      id: 3,
      question: "What's something beautiful you noticed today?",
      category: 'mindfulness',
    },
    {
      id: 4,
      question: 'What challenge helped you grow recently?',
      category: 'growth',
    },
    {
      id: 5,
      question: 'What simple pleasure brought you joy?',
      category: 'joy',
    },
  ];

  res.json({
    success: true,
    data: {
      title: 'Gratitude Prompts',
      description: 'Take a moment to reflect on these questions. Writing down your answers can amplify the positive effects.',
      prompts,
    },
  });
});

module.exports = router;