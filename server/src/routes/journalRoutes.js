const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const PDFDocument = require('pdfkit');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// POST /api/journal/create - Create new journal entry
router.post('/create', async (req, res) => {
  try {
    const { userId, content, emotionTag } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        error: 'userId and content are required',
      });
    }

    const journalData = {
      userId,
      content,
      emotionTag: emotionTag || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('journals').add(journalData);

    console.log(`📔 Journal created: ${docRef.id} for user ${userId}`);

    res.json({
      success: true,
      data: {
        journalId: docRef.id,
        ...journalData,
      },
    });
  } catch (error) {
    console.error('Journal create error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/journal/list/:userId - Get all journal entries
router.get('/list/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const snapshot = await db
      .collection('journals')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const journals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
      updatedAt: doc.data().updatedAt.toDate().toISOString(),
    }));

    res.json({
      success: true,
      data: journals,
      count: journals.length,
    });
  } catch (error) {
    console.error('Journal list error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/journal/:journalId - Get single journal entry
router.get('/:journalId', async (req, res) => {
  try {
    const { journalId } = req.params;

    const doc = await db.collection('journals').doc(journalId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found',
      });
    }

    const journalData = doc.data();

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...journalData,
        createdAt: journalData.createdAt.toDate().toISOString(),
        updatedAt: journalData.updatedAt.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error('Journal get error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/journal/:journalId - Update journal entry
router.put('/:journalId', async (req, res) => {
  try {
    const { journalId } = req.params;
    const { content, emotionTag } = req.body;

    const updateData = {
      updatedAt: new Date(),
    };

    if (content) updateData.content = content;
    if (emotionTag) updateData.emotionTag = emotionTag;

    await db.collection('journals').doc(journalId).update(updateData);

    res.json({
      success: true,
      message: 'Journal entry updated',
    });
  } catch (error) {
    console.error('Journal update error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/journal/:journalId - Delete journal entry
router.delete('/:journalId', async (req, res) => {
  try {
    const { journalId } = req.params;

    await db.collection('journals').doc(journalId).delete();

    console.log(`🗑️ Journal deleted: ${journalId}`);

    res.json({
      success: true,
      message: 'Journal entry deleted',
    });
  } catch (error) {
    console.error('Journal delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/journal/search/:userId - Search and filter journals
router.get('/search/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { keyword, emotion, startDate, endDate } = req.query;

    let query = db.collection('journals').where('userId', '==', userId);

    // Filter by emotion tag
    if (emotion) {
      query = query.where('emotionTag', '==', emotion);
    }

    // Filter by date range
    if (startDate) {
      query = query.where('createdAt', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('createdAt', '<=', new Date(endDate));
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    let journals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate().toISOString(),
    }));

    // Search by keyword in content
    if (keyword) {
      journals = journals.filter(journal =>
        journal.content.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: journals,
      count: journals.length,
    });
  } catch (error) {
    console.error('Journal search error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/journal/prompts/:emotion - Get AI journal prompts based on emotion
router.get('/prompts/:emotion', async (req, res) => {
  try {
    const { emotion } = req.params;

    const fallbackPrompts = {
      stressed: [
        'What is causing you the most stress right now?',
        'What would help you feel more calm today?',
        'What can you control in this situation?',
      ],
      anxious: [
        'What are you worried about right now?',
        'What evidence do you have that things will be okay?',
        'What would you tell a friend in this situation?',
      ],
      sad: [
        'What made you feel this way?',
        'What usually helps you feel better?',
        'What are you grateful for today, even if small?',
      ],
      happy: [
        'What made you smile today?',
        'Who or what are you grateful for?',
        'How can you spread this positivity?',
      ],
      overwhelmed: [
        'What feels like too much right now?',
        'What is one small thing you can do today?',
        'Who can you reach out to for support?',
      ],
      angry: [
        'What triggered this anger?',
        'How can you express this in a healthy way?',
        'What would help you feel calmer?',
      ],
      calm: [
        'What brought you peace today?',
        'How can you maintain this sense of calm?',
        'What are you grateful for in this moment?',
      ],
      neutral: [
        'How are you really feeling beneath the surface?',
        'What would make today meaningful?',
        'What do you need right now?',
      ],
    };

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Generate 3 thoughtful journal prompts for someone feeling ${emotion}. Make them reflective, compassionate, and helpful for mental wellness. Return ONLY a valid JSON array of 3 strings, no markdown, no extra text.`,
          },
          {
            role: 'user',
            content: `Generate journal prompts for ${emotion}`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 200,
      });

      let responseText = completion.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const prompts = JSON.parse(responseText);

      res.json({
        success: true,
        data: {
          emotion,
          prompts,
          source: 'ai-generated',
        },
      });
    } catch (aiError) {
      console.log('AI failed, using fallback prompts:', aiError.message);
      res.json({
        success: true,
        data: {
          emotion,
          prompts: fallbackPrompts[emotion] || fallbackPrompts.neutral,
          source: 'fallback',
        },
      });
    }
  } catch (error) {
    console.error('Journal prompts error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/journal/export-pdf/:userId - Export journals as PDF
router.get('/export-pdf/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await db
      .collection('journals')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'No journal entries found',
      });
    }

    const journals = snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    }));

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=my-journal.pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(24).text('My Mental Health Journal', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Exported on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Add entries
    journals.forEach((journal, index) => {
      doc.fontSize(14).font('Helvetica-Bold').text(`Entry ${index + 1}`, { underline: true });
      doc.fontSize(10).font('Helvetica').text(journal.createdAt.toDateString());
      if (journal.emotionTag) {
        doc.fillColor('#666').text(`Mood: ${journal.emotionTag}`);
        doc.fillColor('#000');
      }
      doc.moveDown(0.5);
      doc.fontSize(11).text(journal.content, { align: 'justify' });
      doc.moveDown(2);

      // Page break after every 2 entries
      if ((index + 1) % 2 === 0 && index < journals.length - 1) {
        doc.addPage();
      }
    });

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;