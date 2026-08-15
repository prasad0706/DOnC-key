const express = require('express');
const router = express.Router();
const Webhook = require('../models/Webhook');
const verifyToken = require('../middleware/auth');
const logger = require('../utils/logger');

// Require authentication for all webhook routes
router.use(verifyToken);

// POST /api/webhooks — Create a new webhook listener
router.post('/', async (req, res, next) => {
  try {
    const { url, events, projectId, secret } = req.body;

    if (!url || !projectId) {
      return res.status(400).json({ error: 'URL and Project ID are required' });
    }

    const crypto = require('crypto');
    const webhook = new Webhook({
      url,
      events: events || ['document.ready', 'document.failed'],
      secret: secret || crypto.randomBytes(24).toString('hex'),
      projectId,
      userId: req.user.uid
    });

    await webhook.save();

    logger.info('Webhook registered', { webhookId: webhook._id, projectId, url });
    res.status(201).json(webhook);
  } catch (error) {
    next(error);
  }
});

// GET /api/webhooks — List all webhook listeners for a project
router.get('/', async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const webhooks = await Webhook.find({ 
      projectId, 
      userId: req.user.uid 
    }).sort({ createdAt: -1 });

    res.json(webhooks);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/webhooks/:id — Delete a webhook listener
router.delete('/:id', async (req, res, next) => {
  try {
    const webhook = await Webhook.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    logger.info('Webhook deleted', { webhookId: req.params.id });
    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
