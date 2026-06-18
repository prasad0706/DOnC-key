require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// ─── App Setup ──────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost')) return callback(null, true);
    if (origin === 'https://d-on-c-key.vercel.app') return callback(null, true);
    if (origin === 'https://donc-key-frontend.onrender.com') return callback(null, true);
    callback(null, false);
  },
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(apiLimiter); // Global rate limiting

// ─── Database Connection ────────────────────────────────────

mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => {
    logger.error('MongoDB connection error', { error: err.message });
    process.exit(1);
  });

// ─── Routes ─────────────────────────────────────────────────

// Health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Document Intelligence API is running' });
});

// Serve local uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'temp')));

// Mount route modules
app.use('/api/documents', require('./routes/documents'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/documents', require('./routes/apiKeys'));
app.use('/api/documents', require('./routes/chat'));
app.use('/api/v1', require('./routes/data'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/usage', require('./routes/usage'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/logs', require('./routes/logs'));

// ─── Error Handling ─────────────────────────────────────────

app.use(errorHandler);

// ─── Server Start ───────────────────────────────────────────

function startServer(port) {
  const server = app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} is busy, trying ${parseInt(port) + 1}...`);
      if (port < PORT + 10) {
        setTimeout(() => startServer(parseInt(port) + 1), 1000);
      } else {
        logger.error(`Could not find an available port after trying ${PORT} through ${PORT + 10}`);
      }
    } else {
      logger.error('Server error', { error: err.message });
    }
  });
}

startServer(PORT);

logger.info('Document Intelligence API Server starting...');
