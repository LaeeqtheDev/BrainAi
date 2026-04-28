const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');

// PUBLIC routes — no auth (must come before router.use(verifyToken))
router.get('/privacy-policy/content', async (req, res) => {
  try {
    const doc = await db.collection('appContent').doc('privacyPolicy').get();
    if (!doc.exists) {
      return res.json({
        success: true,
        data: { title: 'Privacy Policy', lastUpdated: 'Not set', content: 'Coming soon.' },
      });
    }
    res.json({ success: true, data: doc.data() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/help-support/info', async (req, res) => {
  try {
    const doc = await db.collection('appContent').doc('helpSupport').get();
    if (!doc.exists) {
      return res.json({
        success: true,
        data: { title: 'Help & Support', faqs: [], contact: { email: 'support@stillwater.app' } },
      });
    }
    res.json({ success: true, data: doc.data() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PROTECTED routes from here down
router.use(verifyToken);

// GET /api/settings/me
router.get('/me', async (req, res) => {
  try {
    const { userId } = req.user;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      // Auto-create the user doc if missing (handles old accounts created before settings doc)
      const defaults = {
        userId,
        email: req.user.email || '',
        name: '',
        bio: '',
        profilePicture: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        notifications: { dailyReminders: true, breathingReminders: true, weeklyInsights: true },
        general: { language: 'English' },
        privacy: { dataCollection: true, analytics: true },
        security: { appLock: false, biometricEnabled: false },
      };
      await db.collection('users').doc(userId).set(defaults);
      return res.json({
        success: true,
        data: {
          userId,
          name: '',
          email: req.user.email || '',
          bio: '',
          profilePicture: null,
          settings: {
            notifications: defaults.notifications,
            general: defaults.general,
            privacy: defaults.privacy,
            security: defaults.security,
          },
        },
      });
    }

    const u = userDoc.data();
    res.json({
      success: true,
      data: {
        userId,
        name: u.name || '',
        email: u.email || req.user.email || '',
        bio: u.bio || '',
        profilePicture: u.profilePicture || null,
        settings: {
          notifications: u.notifications || { dailyReminders: true, breathingReminders: true, weeklyInsights: true },
          general: u.general || { language: 'English' },
          privacy: u.privacy || { dataCollection: true, analytics: true },
          security: u.security || { appLock: false, biometricEnabled: false },
        },
      },
    });
  } catch (e) {
    console.error('GET /me error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/settings/me/profile
router.put('/me/profile', async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, bio, profilePicture } = req.body;
    const update = { updatedAt: new Date() };
    if (typeof name === 'string') update.name = name.trim();
    if (typeof bio === 'string') update.bio = bio.trim();
    if (typeof profilePicture === 'string') update.profilePicture = profilePicture;

    await db.collection('users').doc(userId).set(update, { merge: true });

    if (update.name) {
      try { await auth.updateUser(userId, { displayName: update.name }); } catch {}
    }
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /me/profile error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/settings/me/notifications
router.put('/me/notifications', async (req, res) => {
  try {
    const { userId } = req.user;
    const { dailyReminders, breathingReminders, weeklyInsights } = req.body;
    await db.collection('users').doc(userId).set({
      notifications: {
        dailyReminders: !!dailyReminders,
        breathingReminders: !!breathingReminders,
        weeklyInsights: !!weeklyInsights,
      },
      updatedAt: new Date(),
    }, { merge: true });
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /me/notifications error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/settings/me/security
router.put('/me/security', async (req, res) => {
  try {
    const { userId } = req.user;
    const { appLock, biometricEnabled } = req.body;
    await db.collection('users').doc(userId).set({
      security: {
        appLock: !!appLock,
        biometricEnabled: !!biometricEnabled,
      },
      updatedAt: new Date(),
    }, { merge: true });
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /me/security error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/settings/me/privacy
router.put('/me/privacy', async (req, res) => {
  try {
    const { userId } = req.user;
    const { dataCollection, analytics } = req.body;
    await db.collection('users').doc(userId).set({
      privacy: {
        dataCollection: !!dataCollection,
        analytics: !!analytics,
      },
      updatedAt: new Date(),
    }, { merge: true });
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /me/privacy error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// PUT /api/settings/me/language
router.put('/me/language', async (req, res) => {
  try {
    const { userId } = req.user;
    const { language } = req.body;
    if (!['English', 'Urdu'].includes(language)) {
      return res.status(400).json({ success: false, error: 'Language must be English or Urdu' });
    }
    await db.collection('users').doc(userId).set({
      general: { language },
      updatedAt: new Date(),
    }, { merge: true });
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /me/language error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/settings/me/export-data
router.post('/me/export-data', async (req, res) => {
  try {
    const { userId } = req.user;
    const [user, chats, moods, journals] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('chats').where('userId', '==', userId).get(),
      db.collection('moodLogs').where('userId', '==', userId).get(),
      db.collection('journals').where('userId', '==', userId).get(),
    ]);

    const stripDates = (d) => {
      const out = { ...d };
      Object.keys(out).forEach((k) => {
        if (out[k]?.toDate) out[k] = out[k].toDate().toISOString();
      });
      return out;
    };

    res.json({
      success: true,
      data: {
        user: user.exists ? stripDates(user.data()) : null,
        chats: chats.docs.map((d) => stripDates(d.data())),
        moodLogs: moods.docs.map((d) => stripDates(d.data())),
        journals: journals.docs.map((d) => stripDates(d.data())),
        exportedAt: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error('POST /me/export-data error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE /api/settings/me/account
router.delete('/me/account', async (req, res) => {
  try {
    const { userId } = req.user;
    const collections = ['chats', 'moodLogs', 'journals', 'notifications', 'guestChats'];
    for (const col of collections) {
      const snap = await db.collection(col).where('userId', '==', userId).get();
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      if (snap.size) await batch.commit();
    }
    await db.collection('users').doc(userId).delete();
    try { await auth.deleteUser(userId); } catch {}
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE /me/account error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;