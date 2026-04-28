const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', async (req, res) => {
  try {
    const { userId, email } = req.user;
    const { topic, message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'message required' });

    await db.collection('feedback').add({
      userId, email, topic: topic || 'Other', message,
      createdAt: new Date(),
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;