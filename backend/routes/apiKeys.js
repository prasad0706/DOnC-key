const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const Document = require('../models/Document');
const verifyToken = require('../middleware/auth');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { validate, paramSchemas } = require('../middleware/validators');

// All API key routes require authentication
router.use(verifyToken);

// POST /api/documents/:documentId/api-keys — Generate API Key
router.post('/:documentId/api-keys', validate(paramSchemas.documentId, 'params'), async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      throw new NotFoundError('Document');
    }

    if (document.status !== 'ready') {
      throw new ValidationError('Document is not ready for API key generation');
    }

    // Generate a random API key with a prefix for fast lookup
    const rawKey = `doc_${crypto.randomBytes(24).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 12); // Store first 12 chars for indexed lookup
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKeyRecord = new ApiKey({
      documentId,
      keyHash,
      keyPrefix
    });

    await apiKeyRecord.save();

    logger.info('API key generated', { documentId });

    res.status(201).json({
      apiKey: rawKey,
      message: 'Store this key securely. It will not be shown again.'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:documentId/api-keys — List API keys for a document
router.get('/:documentId/api-keys', validate(paramSchemas.documentId, 'params'), async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      throw new NotFoundError('Document');
    }

    const apiKeys = await ApiKey.find({ documentId });

    const formattedKeys = apiKeys.map(key => ({
      id: key._id,
      documentId: key.documentId,
      keyPrefix: key.keyPrefix,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
      revoked: key.revoked || false
    }));

    res.json(formattedKeys);
  } catch (error) {
    next(error);
  }
});

// PUT/PATCH /api/documents/:documentId/api-keys/:keyId/revoke — Revoke an API key
const revokeHandler = async (req, res, next) => {
  try {
    const { documentId, keyId } = req.params;

    const apiKey = await ApiKey.findOne({ _id: keyId, documentId });
    if (!apiKey) {
      throw new NotFoundError('API key');
    }

    apiKey.revoked = true;
    await apiKey.save();

    logger.info('API key revoked', { documentId, keyId });

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    next(error);
  }
};

router.patch('/:documentId/api-keys/:keyId/revoke', revokeHandler);
router.put('/:documentId/api-keys/:keyId/revoke', revokeHandler);

module.exports = router;
