const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');

// POST /api/auth/signup - Create new user

router.post('/signup', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ success: false, error: 'email and name required' });

    // Find existing Firebase Auth user (created by client SDK)
    let uid;
    try {
      const userRecord = await auth.getUserByEmail(email);
      uid = userRecord.uid;
    } catch {
      return res.status(404).json({ success: false, error: 'Auth user not found yet' });
    }

    await db.collection('users').doc(uid).set({
      userId: uid, email, name, profilePicture: null,
      createdAt: new Date(), updatedAt: new Date(),
      notifications: { dailyReminders: true, breathingReminders: true, weeklyInsights: true },
      general: { language: 'English' },
      privacy: { dataCollection: true, analytics: true },
      security: { appLock: false, biometricEnabled: false },
    }, { merge: true });

    res.json({ success: true, data: { userId: uid, email, name } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/auth/verify-token - Verify Firebase token (for login)
router.post('/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'idToken required',
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    res.json({
      success: true,
      data: {
        userId,
        email: decodedToken.email,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
});

// GET /api/auth/user/:userId - Get user details
router.get('/user/:userId', async (req, res) => {
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

    res.json({
      success: true,
      data: {
        userId,
        email: userData.email,
        name: userData.name,
        profilePicture: userData.profilePicture,
        createdAt: userData.createdAt.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;