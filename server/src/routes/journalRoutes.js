const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🔐 Protect all routes
router.use(verifyToken);

/* =========================
   CREATE JOURNAL
========================= */
router.post('/create', async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, content, emotionTag } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'content is required',
      });
    }

    const journalData = {
      userId,
      title: title || 'Untitled',
      content,
      emotionTag: emotionTag || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('journals').add(journalData);

    res.json({
      success: true,
      data: {
        journalId: docRef.id,
        ...journalData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   LIST JOURNALS
========================= */
router.get('/list', async (req, res) => {
  try {
    const { userId } = req.user;
    const limit = parseInt(req.query.limit) || 50;

    const snapshot = await db
      .collection('journals')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const journals = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString(),
      };
    });

    res.json({
      success: true,
      data: journals,
      count: journals.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   GET SINGLE JOURNAL
========================= */
router.get('/:journalId', async (req, res) => {
  try {
    const { userId } = req.user;
    const { journalId } = req.params;

    const doc = await db.collection('journals').doc(journalId).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    const data = doc.data();

    if (data.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   UPDATE JOURNAL
========================= */
router.put('/:journalId', async (req, res) => {
  try {
    const { userId } = req.user;
    const { journalId } = req.params;
    const { title, content, emotionTag } = req.body;

    const docRef = db.collection('journals').doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const update = { updatedAt: new Date() };
    if (title) update.title = title;
    if (content) update.content = content;
    if (emotionTag) update.emotionTag = emotionTag;

    await docRef.update(update);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   DELETE JOURNAL
========================= */
router.delete('/:journalId', async (req, res) => {
  try {
    const { userId } = req.user;
    const { journalId } = req.params;

    const docRef = db.collection('journals').doc(journalId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await docRef.delete();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   SEARCH JOURNALS
========================= */
router.get('/search', async (req, res) => {
  try {
    const { userId } = req.user;
    const { keyword, emotion } = req.query;

    let query = db.collection('journals').where('userId', '==', userId);

    if (emotion) {
      query = query.where('emotionTag', '==', emotion);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (keyword) {
      results = results.filter(j =>
        j.content.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   JOURNAL PROMPTS (AI)
========================= */
router.get('/prompts/:emotion', async (req, res) => {
  try {
    const { emotion } = req.params;

    const fallback = {
      stressed: [
        'What is causing you the most stress right now?',
        'What can you control today?',
        'What would help you feel calmer?'
      ],
      anxious: [
        'What are you worried about?',
        'Is this fear factual or imagined?',
        'What would stability look like today?'
      ],
      sad: [
        'What is weighing on you right now?',
        'What do you need emotionally?',
        'What brought you comfort before?'
      ],
      neutral: [
        'How are you really feeling?',
        'What do you need today?',
        'What matters most right now?'
      ],
    };

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Generate 3 journal prompts for ${emotion}. Return ONLY JSON array.`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 200,
      });

      let text = completion.choices[0].message.content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const prompts = JSON.parse(text);

      res.json({
        success: true,
        data: { emotion, prompts, source: 'ai' },
      });

    } catch {
      res.json({
        success: true,
        data: {
          emotion,
          prompts: fallback[emotion] || fallback.neutral,
          source: 'fallback',
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* =========================
   EXPORT PDF
========================= */
router.get('/export-pdf', async (req, res) => {
  try {
    const { userId } = req.user;

    const snapshot = await db
      .collection('journals')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const journals = snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    }));

    const pdf = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=journal.pdf');

    pdf.pipe(res);

    pdf.fontSize(20).text('Mental Health Journal', { align: 'center' });
    pdf.moveDown();

    journals.forEach((j, i) => {
      pdf.fontSize(12).text(`Entry ${i + 1}`, { underline: true });
      pdf.text(j.createdAt.toDateString());
      pdf.moveDown(0.5);
      pdf.text(j.content);
      pdf.moveDown(1);
    });

    pdf.end();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;