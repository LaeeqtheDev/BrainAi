const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// POST /api/notifications/schedule
router.post('/schedule', async (req, res) => {
  try {
    const { userId, type, title, message, scheduledTime } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId, type, title, and message required',
      });
    }

    const notificationRef = await db.collection('notifications').add({
      userId,
      type, // 'breathing', 'mood_check', 'daily_inspiration', 'journal_reminder', 'encouragement'
      title,
      message,
      scheduledTime: scheduledTime || new Date(),
      sent: false,
      read: false,
      createdAt: new Date(),
    });

    console.log(`Notification scheduled for user ${userId}`);

    res.json({
      success: true,
      data: {
        notificationId: notificationRef.id,
        message: 'Notification scheduled',
      },
    });
  } catch (error) {
    console.error('Schedule notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/notifications/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const snapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
      scheduledTime: doc.data().scheduledTime.toDate().toISOString(),
    }));

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/notifications/:notificationId/read
router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/notifications/templates/all
router.get('/templates/all', (req, res) => {
  const templates = {
    breathing: {
      title: 'Time for a breathing break',
      message: 'Take 2 minutes to center yourself with deep breathing',
      icon: 'wind',
    },
    moodCheck: {
      title: 'Check in with your mood',
      message: 'How are you feeling today? Track your emotional journey',
      icon: 'heart',
    },
    dailyInspiration: {
      title: 'Daily inspiration',
      message: 'Every moment is a fresh beginning.',
      icon: 'sparkles',
    },
    journalReminder: {
      title: 'Journal reminder',
      message: 'Reflect on your day. What went well? What challenged you?',
      icon: 'book',
    },
    encouragement: {
      title: "You're doing great!",
      message: "You've logged your mood 5 days in a row. Keep it up! 👏",
      icon: 'heart',
    },
    gentleReminder: {
      title: 'Gentle Reminders',
      message: "We'll send you peaceful reminders to support your mental wellness journey.",
      icon: 'bell',
    },
  };

  res.json({
    success: true,
    data: templates,
  });
});

module.exports = router;