const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');

// POST /api/auth/signup - Create new user
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    //  Create user document with DEFAULT SETTINGS
    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      email,
      name,
      profilePicture: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      //  DEFAULT SETTINGS
      notifications: {
        dailyReminders: true,
        breathingReminders: true,
        weeklyInsights: true,
      },
      general: {
        language: 'English',
      },
      privacy: {
        dataCollection: true,
        analytics: true,
      },
      security: {
        appLock: false,
        biometricEnabled: false,
      },
    });

    console.log(` User created: ${userRecord.uid}`);

    res.json({
      success: true,
      data: {
        userId: userRecord.uid,
        email,
        name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
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