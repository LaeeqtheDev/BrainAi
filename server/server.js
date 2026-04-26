require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');

const authRoutes         = require('./src/routes/authRoutes');
const chatRoutes         = require('./src/routes/chatRoutes');
const moodRoutes         = require('./src/routes/moodRoutes');
const journalRoutes      = require('./src/routes/journalRoutes');
const toolkitRoutes      = require('./src/routes/toolkitRoutes');
const quranRoutes        = require('./src/routes/quranRoutes');
const crisisRoutes       = require('./src/routes/crisisRoutes');
const settingsRoutes     = require('./src/routes/settingsRoutes');
const reportRoutes       = require('./src/routes/reportRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', apiLimiter);

app.get('/', (req, res) => res.json({ ok: true, service: 'Stillwater API' }));
app.get('/api/health', (req, res) => res.json({ status: 'healthy', time: new Date().toISOString() }));

app.use('/api/auth',          authRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/mood',          moodRoutes);
app.use('/api/journal',       journalRoutes);
app.use('/api/toolkit',       toolkitRoutes);
app.use('/api/quran',         quranRoutes);
app.use('/api/crisis',        crisisRoutes);
app.use('/api/settings',      settingsRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Stillwater API listening on http://0.0.0.0:${PORT}`);
});