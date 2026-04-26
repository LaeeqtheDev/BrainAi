const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');

// 🔐 Protect all routes
router.use(verifyToken);

/**
 * POST /api/notifications/schedule
 * SELF ONLY (userId removed from body)
 */
router.post('/schedule', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, title, message, scheduledTime } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'type, title, and message required',
      });
    }

    const notificationRef = await db.collection('notifications').add({
      userId,
      type,
      title,
      message,
      scheduledTime: scheduledTime || new Date(),
      sent: false,
      read: false,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        notificationId: notificationRef.id,
        message: 'Notification scheduled',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/notifications
 * SELF ONLY (no :userId param)
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;

    const snapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString?.() || null,
        scheduledTime: data.scheduledTime?.toDate?.().toISOString?.() || null,
      };
    });

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/notifications/:notificationId/read
 * SELF VERIFIED (ensures ownership)
 */
router.put('/:notificationId/read', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const doc = await db.collection('notifications').doc(notificationId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/notifications/templates/all
 * PUBLIC (safe static config)
 */
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
      message: "You've been consistent. Keep going 👏",
      icon: 'heart',
    },
    gentleReminder: {
      title: 'Gentle Reminders',
      message: 'Supportive nudges for your mental wellness journey.',
      icon: 'bell',
    },
  };

  res.json({
    success: true,
    data: templates,
  });
});

module.exports = router;