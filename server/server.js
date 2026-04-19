const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(apiLimiter); // Apply rate limiting

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Mental Health API Running (AI-Powered)',
    version: '2.0.0',
    features: {
      ai: 'Groq Llama 3.3 70B',
      nlp: 'Hybrid (AI + Keywords)',
      quotes: 'AI-Generated',
      quran: 'AI-Recommended',
      guestMode: '3 free messages',
    },
  });
});

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const moodRoutes = require('./src/routes/moodRoutes');
const journalRoutes = require('./src/routes/journalRoutes');
const quranRoutes = require('./src/routes/quranRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const toolkitRoutes = require('./src/routes/toolkitRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const crisisRoutes = require('./src/routes/crisisRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/toolkit', toolkitRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/crisis', crisisRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(`AI-Powered Backend Ready`);
});