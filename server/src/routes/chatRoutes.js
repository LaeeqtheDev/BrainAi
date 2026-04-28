const express = require('express');
const router = express.Router(); // ✅ FIX (THIS WAS MISSING)

const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');
const { analyzeEmotionConversational } = require('../services/groqService');

// protect routes
router.use(verifyToken);


// GET /api/chat/opener — generates a contextual greeting based on user history
router.get('/opener', async (req, res) => {
  try {
    const { userId } = req.user;

    // Build context same as /message
    const userContext = await buildUserContext(userId);

    // Get last 1-2 chat exchanges so we know what we last talked about
    const lastChatSnap = await db.collection('chats')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(3).get();

    const lastTopics = lastChatSnap.docs.reverse().map((doc) => ({
      userSaid: doc.data().userMessage,
      youSaid: doc.data().aiResponse,
      when: doc.data().timestamp.toDate().toISOString(),
    }));

    const opener = await generateOpener(userContext, lastTopics);

    res.json({ success: true, data: opener });
  } catch (e) {
    console.error('Opener error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});


// =========================
// CHAT MESSAGE
// =========================
router.post('/message', async (req, res) => {
  try {
    const { userId } = req.user;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'message required',
      });
    }

    // fetch last chats
    const historySnap = await db.collection('chats')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const conversationHistory = historySnap.docs
      .map(d => {
        const c = d.data();
        return [
          { role: 'user', content: c.userMessage },
          { role: 'assistant', content: c.aiResponse }
        ];
      })
      .flat()
      .reverse();

    // AI response
    const analysis = await analyzeEmotionConversational(message, conversationHistory);

    // crisis detection (simple + safe)
    const crisisWords = ['suicide', 'kill myself', 'end my life', 'die'];

    const crisisFlag = crisisWords.some(w =>
      message.toLowerCase().includes(w)
    );

    // save chat
    const chatRef = await db.collection('chats').add({
      userId,
      userMessage: message,
      aiResponse: analysis.response,
      emotion: analysis.emotion,
      timestamp: new Date(),
      crisisFlag,
    });

    return res.json({
      success: true,
      data: {
        chatId: chatRef.id,
        response: analysis.response,
        emotion: analysis.emotion,
        followUpPrompts: analysis.followUpPrompts || [],
        crisisFlag,
        crisisResources: crisisFlag
          ? {
              message: "You are not alone. Support is available.",
              hotline: "Emergency: 1122 / Local helpline",
            }
          : null,
      },
    });

  } catch (e) {
    console.error('chat error:', e);

    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
});

// =========================
// CHAT HISTORY
// =========================
router.get('/history', async (req, res) => {
  try {
    const { userId } = req.user;
    const limit = parseInt(req.query.limit) || 50;

    const snap = await db.collection('chats')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const chats = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp.toDate().toISOString(),
    }));

    return res.json({
      success: true,
      data: chats,
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
});

// =========================
// CLEAR CHAT
// =========================
router.delete('/clear', async (req, res) => {
  try {
    const { userId } = req.user;

    const snap = await db.collection('chats')
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return res.json({
      success: true,
      cleared: snap.size,
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
});

module.exports = router;