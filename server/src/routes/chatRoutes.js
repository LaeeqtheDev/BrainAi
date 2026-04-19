const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { analyzeEmotionConversational } = require('../services/groqService');

// POST /api/chat/message (Supports both authenticated and guest users)
router.post('/message', async (req, res) => {
  try {
    const { userId, message, isGuest } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'userId and message required' 
      });
    }

    console.log(`${isGuest ? 'Guest' : 'User'} ${userId}: "${message}"`);

    // Get conversation history
    const collection = isGuest ? 'guestChats' : 'chats';
    const historySnapshot = await db
      .collection(collection)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    // Check message limit for guests
    if (isGuest && historySnapshot.size >= 3) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        message: 'You\'ve reached your trial limit. Create an account to continue your wellness journey.',
        messageCount: historySnapshot.size,
      });
    }

    // Build conversation history for AI context
    const conversationHistory = [];
    historySnapshot.docs.reverse().forEach((doc) => {
      const chat = doc.data();
      conversationHistory.push({
        role: 'user',
        content: chat.userMessage,
      });
      conversationHistory.push({
        role: 'assistant',
        content: chat.aiResponse,
      });
    });

    console.log(` Loaded ${conversationHistory.length / 2} previous messages for context`);

    // Analyze with conversation context + NLP
    const analysis = await analyzeEmotionConversational(message, conversationHistory);

    console.log(`Emotion: ${analysis.emotion} (confidence: ${analysis.nlpAnalysis?.confidence})`);

    // Save to appropriate collection
    const chatRef = await db.collection(collection).add({
      userId,
      userMessage: message,
      aiResponse: analysis.response,
      emotion: analysis.emotion,
      suggestion: analysis.suggestion,
      followUpPrompts: analysis.followUpPrompts || [],
      
      // NLP metadata
      nlpAnalysis: analysis.nlpAnalysis || null,
      
      timestamp: new Date(),
      isGuest: isGuest || false,
    });

    // Calculate remaining messages for guest
    const messagesRemaining = isGuest ? 3 - (historySnapshot.size + 1) : null;

    // Save mood log (only for authenticated users with meaningful emotions)
    if (!isGuest && analysis.emotion !== 'neutral') {
      await db.collection('moodLogs').add({
        userId,
        emotion: analysis.emotion,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date(),
        source: 'chat',
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
        nlpAnalysis: analysis.nlpAnalysis,
      },
      isGuest,
      messagesRemaining,
      showLoginPrompt: isGuest && messagesRemaining === 0,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/chat/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isGuest } = req.query;
    const limit = parseInt(req.query.limit) || 50;

    const collection = isGuest === 'true' ? 'guestChats' : 'chats';

    const snapshot = await db
      .collection(collection)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString(),
    }));

    res.json({ 
      success: true, 
      data: chats,
      messageCount: chats.length,
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// DELETE /api/chat/clear/:userId (Clear conversation)
router.delete('/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isGuest } = req.query;

    const collection = isGuest === 'true' ? 'guestChats' : 'chats';

    const snapshot = await db
      .collection(collection)
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`Cleared ${snapshot.size} messages for ${isGuest ? 'guest' : 'user'} ${userId}`);

    res.json({
      success: true,
      message: `Cleared ${snapshot.size} messages`,
    });
  } catch (error) {
    console.error(' Clear chat error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;