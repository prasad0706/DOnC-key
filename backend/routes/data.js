const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const DocumentData = require('../models/DocumentData');
const ApiUsage = require('../models/ApiUsage');
const ApiLog = require('../models/ApiLog');
const Document = require('../models/Document');
const logger = require('../utils/logger');
const { dataApiLimiter } = require('../middleware/rateLimiter');

/**
 * Verify API key using prefix-based lookup (O(1) DB lookup + SHA-256 hash match)
 * instead of scanning all keys with bcrypt.
 */
async function verifyApiKey(req, res, next) {
  const startTime = Date.now();
  const apiKey = req.headers['x-api-key'];

  res.on('finish', async () => {
    const latency = Date.now() - startTime;
    if (req.documentId) {
      try {
        const doc = await Document.findById(req.documentId).select('userId');
        await ApiLog.create({
          documentId: req.documentId,
          endpoint: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          latencyMs: latency,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userId: doc ? doc.userId : null
        });
      } catch (err) {
        logger.error('Failed to log API request in ApiLog', { error: err.message });
      }
    }
  });

  if (!apiKey) {
    await ApiUsage.create({
      documentId: 'unknown',
      endpoint: req.originalUrl,
      success: false,
      latency: Date.now() - startTime
    });
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const keyPrefix = apiKey.substring(0, 12);
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    // O(1) indexed database match
    const matchedKey = await ApiKey.findOne({ keyPrefix, keyHash: hashedKey, revoked: false });

    if (!matchedKey) {
      await ApiUsage.create({
        documentId: 'unknown',
        endpoint: req.originalUrl,
        success: false,
        latency: Date.now() - startTime
      });
      return res.status(403).json({ error: 'Invalid API key' });
    }

    req.documentId = matchedKey.documentId;

    // Record successful usage
    await ApiUsage.create({
      documentId: req.documentId,
      endpoint: req.originalUrl,
      success: true,
      latency: Date.now() - startTime
    });

    return next();
  } catch (error) {
    logger.error('API key verification error', { error: error.message });
    return res.status(500).json({ error: 'Authentication error' });
  }
}

// GET /api/v1/data — Public data retrieval via API key
router.get('/data', dataApiLimiter, verifyApiKey, async (req, res, next) => {
  try {
    const documentData = await DocumentData.findOne({ documentId: req.documentId });

    if (!documentData) {
      return res.status(404).json({ error: 'Document data not found' });
    }

    res.json({
      documentId: req.documentId,
      data: documentData.data
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/extract/:documentId — Protected data extraction
router.get('/extract/:documentId', dataApiLimiter, verifyApiKey, async (req, res, next) => {
  try {
    if (req.params.documentId !== req.documentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = await DocumentData.findOne({ documentId: req.documentId });
    if (!data) {
      return res.status(404).json({ error: 'No data found' });
    }

    res.json(data.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
