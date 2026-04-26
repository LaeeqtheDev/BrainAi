const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');
const { analyzeEmotionConversational } = require('../services/groqService');

router.use(verifyToken);

// Build full user context for the AI
async function buildUserContext(userId) {
  const userDoc = await db.collection('users').doc(userId).get();
  const userName = userDoc.exists ? userDoc.data().name : 'friend';

  // Last 10 moods
  const moodSnap = await db.collection('moodLogs')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc').limit(10).get();
  const recentMoods = moodSnap.docs.map((d) => {
    const data = d.data();
    return {
      emotion: data.emotion,
      intensity: data.intensity,
      note: data.note,
      moodKey: data.moodKey,
      when: data.timestamp.toDate().toISOString(),
    };
  });

  // Last 5 journal entries (snippet only)
  const journalSnap = await db.collection('journals')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc').limit(5).get();
  const recentJournal = journalSnap.docs.map((d) => {
    const data = d.data();
    return {
      title: data.title,
      snippet: (data.content || '').slice(0, 240),
      emotionTag: data.emotionTag,
      when: data.createdAt.toDate().toISOString(),
    };
  });

  // Streak
  let currentStreak = 0;
  if (recentMoods.length) {
    const dates = [...new Set(recentMoods.map((m) => {
      const dt = new Date(m.when); dt.setHours(0, 0, 0, 0); return dt.getTime();
    }))].sort((a, b) => b - a);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (dates[0] === today.getTime() || dates[0] === today.getTime() - 86400000) {
      currentStreak = 1;
      for (let i = 0; i < dates.length - 1; i++) {
        if (dates[i] - dates[i + 1] === 86400000) currentStreak++;
        else break;
      }
    }
  }

  // Dominant emotion (last 7 days)
  const weekAgo = Date.now() - 7 * 86400000;
  const recentForDominant = recentMoods.filter((m) => new Date(m.when).getTime() >= weekAgo);
  const counts = {};
  recentForDominant.forEach((m) => { counts[m.emotion] = (counts[m.emotion] || 0) + 1; });
  const dominantEmotion = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;

  return { userName, recentMoods, recentJournal, currentStreak, dominantEmotion };
}

// POST /api/chat/message
router.post('/message', chatLimiter, async (req, res) => {
  try {
    const { userId } = req.user;
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'message required' });
    }

    // Load chat history (last 20 turns for context)
    const historySnap = await db.collection('chats')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc').limit(20).get();

    const conversationHistory = [];
    historySnap.docs.reverse().forEach((doc) => {
      const c = doc.data();
      conversationHistory.push({ role: 'user', content: c.userMessage });
      conversationHistory.push({ role: 'assistant', content: c.aiResponse });
    });

    // Build rich context
    const userContext = await buildUserContext(userId);
    console.log(`💬 ${userContext.userName} (streak: ${userContext.currentStreak}, dominant: ${userContext.dominantEmotion})`);

    // Analyze + respond
    const analysis = await analyzeEmotionConversational(message, conversationHistory, userContext);

    // Persist
    const chatRef = await db.collection('chats').add({
      userId,
      userMessage: message,
      aiResponse: analysis.response,
      emotion: analysis.emotion,
      suggestion: analysis.suggestion,
      followUpPrompts: analysis.followUpPrompts || [],
      nlpAnalysis: analysis.nlpAnalysis || null,
      crisisFlag: analysis.crisisFlag || false,
      timestamp: new Date(),
    });

    // Auto-log mood from chat (if meaningful and intense)
    if (analysis.emotion && analysis.emotion !== 'neutral' && analysis.nlpAnalysis?.confidence === 'high') {
      await db.collection('moodLogs').add({
        userId,
        emotion: analysis.emotion,
        intensity: analysis.nlpAnalysis?.sentimentIntensity === 'high' ? 8 : 5,
        note: `(from chat) ${message.slice(0, 120)}`,
        source: 'chat',
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      data: {
        chatId: chatRef.id,
        emotion: analysis.emotion,
        response: analysis.response,
        suggestion: analysis.suggestion,
        followUpPrompts: analysis.followUpPrompts,
        crisisFlag: analysis.crisisFlag || false,
        crisisResources: analysis.crisisFlag ? {
          message: "You don't have to face this alone.",
          hotline: '0311-7786264 (Umang Pakistan)',
          emergency: '1122',
        } : null,
      },
    });
  } catch (e) {
    console.error('Chat error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/chat/history
router.get('/history', async (req, res) => {
  try {
    const { userId } = req.user;
    const limit = parseInt(req.query.limit) || 50;

    const snap = await db.collection('chats')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc').limit(limit).get();

    const chats = snap.docs.map((d) => ({
      id: d.id, ...d.data(),
      timestamp: d.data().timestamp.toDate().toISOString(),
    }));
    res.json({ success: true, data: chats, count: chats.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE /api/chat/clear
router.delete('/clear', async (req, res) => {
  try {
    const { userId } = req.user;
    const snap = await db.collection('chats').where('userId', '==', userId).get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    res.json({ success: true, cleared: snap.size });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;