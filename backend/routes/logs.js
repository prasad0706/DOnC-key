const express = require('express');
const router = express.Router();
const ApiLog = require('../models/ApiLog');
const Document = require('../models/Document');
const verifyToken = require('../middleware/auth');

// Require authentication for all log retrieval routes
router.use(verifyToken);

// GET /api/documents/:documentId/logs — Fetch recent request audits for a specific document
router.get('/:documentId/logs', async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Verify document ownership
    const doc = await Document.findOne({ _id: documentId, userId: req.user.uid });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const logs = await ApiLog.find({ documentId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ApiLog.countDocuments({ documentId });

    res.json({
      logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:projectId/logs — Fetch request audits across a project's documents
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Get all document IDs associated with this project that belong to user
    const documents = await Document.find({ projectId, userId: req.user.uid }).select('_id');
    const docIds = documents.map(d => d._id);

    const logs = await ApiLog.find({ documentId: { $in: docIds } })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ApiLog.countDocuments({ documentId: { $in: docIds } });

    res.json({
      logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
