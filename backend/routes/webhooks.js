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

// GET /api/webhooks/dlq — List failed webhook deliveries (Dead Letter Queue)
router.get('/dlq', async (req, res, next) => {
  try {
    const WebhookDLQ = require('../models/WebhookDLQ');
    const { projectId } = req.query;
    const filter = { userId: req.user.uid };
    if (projectId) filter.projectId = projectId;

    const dlqEntries = await WebhookDLQ.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(dlqEntries);
  } catch (error) {
    next(error);
  }
});

// POST /api/webhooks/dlq/:id/replay — Replay a failed webhook delivery
router.post('/dlq/:id/replay', async (req, res, next) => {
  try {
    const WebhookDLQ = require('../models/WebhookDLQ');
    const { webhookQueue } = require('../utils/queue');

    const dlqEntry = await WebhookDLQ.findOne({
      _id: req.params.id,
      userId: req.user.uid
    });

    if (!dlqEntry) {
      return res.status(404).json({ error: 'Failed webhook entry not found' });
    }

    // Re-queue job to BullMQ webhook queue
    await webhookQueue.add('send-webhook', {
      url: dlqEntry.url,
      secret: dlqEntry.secret,
      payload: dlqEntry.payload
    });

    dlqEntry.replayed = true;
    dlqEntry.replayedAt = new Date();
    await dlqEntry.save();

    logger.info('Webhook DLQ job replayed', { dlqId: dlqEntry._id, url: dlqEntry.url });

    res.json({
      message: 'Webhook delivery requeued successfully',
      dlqId: dlqEntry._id,
      replayedAt: dlqEntry.replayedAt
    });
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
