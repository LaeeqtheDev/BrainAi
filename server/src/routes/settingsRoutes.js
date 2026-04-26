const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

// GET user settings (SELF ONLY)
router.get('/me', async (req, res) => {
  try {
    const userId = req.user.userId;

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userData = userDoc.data();

    const settings = {
      notifications: userData.notifications || {
        dailyReminders: true,
        breathingReminders: true,
        weeklyInsights: true,
      },
      general: userData.general || {
        language: 'English',
      },
      privacy: userData.privacy || {
        dataCollection: true,
        analytics: true,
      },
      security: userData.security || {
        appLock: false,
        biometricEnabled: false,
      },
    };

    res.json({
      success: true,
      data: {
        userId,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.profilePicture || null,
        settings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE NOTIFICATIONS
router.put('/me/notifications', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dailyReminders, breathingReminders, weeklyInsights } = req.body;

    await db.collection('users').doc(userId).update({
      'notifications.dailyReminders': dailyReminders,
      'notifications.breathingReminders': breathingReminders,
      'notifications.weeklyInsights': weeklyInsights,
      updatedAt: new Date(),
    });

    res.json({ success: true, message: 'Notification updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// APP LOCK
router.put('/me/app-lock', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { appLock, biometricEnabled } = req.body;

    await db.collection('users').doc(userId).update({
      'security.appLock': appLock,
      'security.biometricEnabled': biometricEnabled,
      updatedAt: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// LANGUAGE
router.put('/language', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { language } = req.body;

    if (!['English', 'Urdu'].includes(language)) {
      return res.status(400).json({ success: false, error: 'Invalid language' });
    }

    await db.collection('users').doc(userId).update({
      'general.language': language,
      updatedAt: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PROFILE PICTURE
router.put('/profile-picture', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { profilePictureUrl } = req.body;

    await db.collection('users').doc(userId).update({
      profilePicture: profilePictureUrl,
      updatedAt: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PRIVACY POLICY
router.get('/privacy-policy/content', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Privacy Policy',
      content: 'Your data is encrypted and secure...',
    },
  });
});

// HELP & SUPPORT
router.get('/help-support/info', (req, res) => {
  res.json({
    success: true,
    data: {
      email: 'support@mentalhealthfitness.com',
      faq: [],
    },
  });
});

// DELETE ACCOUNT
router.delete('/me/account', async (req, res) => {
  try {
    const userId = req.user.userId;

    await db.collection('users').doc(userId).delete();

    const collections = ['chats', 'moodLogs', 'journals', 'notifications'];

    for (const col of collections) {
      const snap = await db.collection(col).where('userId', '==', userId).get();
      snap.forEach(doc => doc.ref.delete());
    }

    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// EXPORT DATA
router.post('/me/export-data', async (req, res) => {
  try {
    const userId = req.user.userId;

    const [user, chats, moods, journals] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('chats').where('userId', '==', userId).get(),
      db.collection('moodLogs').where('userId', '==', userId).get(),
      db.collection('journals').where('userId', '==', userId).get(),
    ]);

    res.json({
      success: true,
      data: {
        user: user.data(),
        chats: chats.docs.map(d => d.data()),
        moods: moods.docs.map(d => d.data()),
        journals: journals.docs.map(d => d.data()),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;