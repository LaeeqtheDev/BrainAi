const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET /api/settings/:userId - Get user settings
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const userData = userDoc.data();

    // Default settings if not set
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
    console.error(' Get settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/settings/:userId/notifications - Update notification preferences
router.put('/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    const { dailyReminders, breathingReminders, weeklyInsights } = req.body;

    await db.collection('users').doc(userId).update({
      'notifications.dailyReminders': dailyReminders,
      'notifications.breathingReminders': breathingReminders,
      'notifications.weeklyInsights': weeklyInsights,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Notification preferences updated',
    });
  } catch (error) {
    console.error(' Update notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/settings/:userId/app-lock - Enable/Disable App Lock
router.put('/:userId/app-lock', async (req, res) => {
  try {
    const { userId } = req.params;
    const { appLock, biometricEnabled } = req.body;

    await db.collection('users').doc(userId).update({
      'security.appLock': appLock,
      'security.biometricEnabled': biometricEnabled,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'App lock settings updated',
    });
  } catch (error) {
    console.error(' Update app lock error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/settings/:userId/language - Update language preference
router.put('/:userId/language', async (req, res) => {
  try {
    const { userId } = req.params;
    const { language } = req.body;

    if (!['English', 'Urdu'].includes(language)) {
      return res.status(400).json({
        success: false,
        error: 'Language must be English or Urdu',
      });
    }

    await db.collection('users').doc(userId).update({
      'general.language': language,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Language preference updated',
    });
  } catch (error) {
    console.error(' Update language error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/settings/:userId/profile-picture - Upload profile picture
router.put('/:userId/profile-picture', async (req, res) => {
  try {
    const { userId } = req.params;
    const { profilePictureUrl } = req.body;

    if (!profilePictureUrl) {
      return res.status(400).json({
        success: false,
        error: 'profilePictureUrl required',
      });
    }

    await db.collection('users').doc(userId).update({
      profilePicture: profilePictureUrl,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Profile picture updated',
      data: { profilePictureUrl },
    });
  } catch (error) {
    console.error(' Update profile picture error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/settings/privacy-policy - Get privacy policy text
router.get('/privacy-policy/content', (req, res) => {
  const privacyPolicy = {
    title: 'Privacy Policy',
    lastUpdated: 'December 2024',
    content: `
**Your Privacy Matters**

No judgment. Your data stays secure and private. We use encryption to protect your conversations and journal entries.

**Data We Collect:**
- Mood logs and emotional trends
- Chat history with AI chatbot
- Journal entries
- Wellness activity usage

**How We Protect Your Data:**
- End-to-end encryption
- Secure Firebase storage
- No third-party sharing
- You can delete your data anytime

**Your Rights:**
- Access your data
- Export your data
- Delete your account permanently
- Control what data we collect
    `,
  };

  res.json({
    success: true,
    data: privacyPolicy,
  });
});

// GET /api/settings/help-support - Get help & support info
router.get('/help-support/info', (req, res) => {
  const helpInfo = {
    title: 'Help & Support',
    faqs: [
      {
        question: 'How does the AI chatbot work?',
        answer: 'Our AI uses advanced NLP to detect your emotions and provide empathetic, personalized support.',
      },
      {
        question: 'Is my data private?',
        answer: 'Yes! All your data is encrypted and stored securely. We never share your information.',
      },
      {
        question: 'Can I export my mood data?',
        answer: 'Yes, you can export all your data from Settings > Data & Storage.',
      },
    ],
    contact: {
      email: 'support@mentalhealthfitness.com',
      university: 'University of Lahore',
      department: 'Department of CS & IT',
    },
  };

  res.json({
    success: true,
    data: helpInfo,
  });
});

// DELETE /api/settings/:userId/account - Delete user account permanently
router.delete('/:userId/account', async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user data from all collections
    await db.collection('users').doc(userId).delete();
    await db.collection('chats').where('userId', '==', userId).get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
    });
    await db.collection('moodLogs').where('userId', '==', userId).get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
    });
    await db.collection('journals').where('userId', '==', userId).get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
    });
    await db.collection('notifications').where('userId', '==', userId).get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
    });

    console.log(`🗑️ User account deleted: ${userId}`);

    res.json({
      success: true,
      message: 'Account deleted permanently. All data has been removed.',
    });
  } catch (error) {
    console.error(' Delete account error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/settings/:userId/export-data - Export all user data
router.post('/:userId/export-data', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all user data
    const userData = await db.collection('users').doc(userId).get();
    const chats = await db.collection('chats').where('userId', '==', userId).get();
    const moods = await db.collection('moodLogs').where('userId', '==', userId).get();
    const journals = await db.collection('journals').where('userId', '==', userId).get();

    const exportData = {
      user: userData.data(),
      chats: chats.docs.map(doc => doc.data()),
      moodLogs: moods.docs.map(doc => doc.data()),
      journals: journals.docs.map(doc => doc.data()),
      exportedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'Data exported successfully',
      data: exportData,
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;