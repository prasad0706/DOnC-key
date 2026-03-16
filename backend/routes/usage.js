const express = require('express');
const router = express.Router();
const ApiUsage = require('../models/ApiUsage');
const ApiKey = require('../models/ApiKey');
const Document = require('../models/Document');
const verifyToken = require('../middleware/auth');
const logger = require('../utils/logger');

router.use(verifyToken);

// GET /api/usage/dashboard-stats — Summary stats for dashboard cards
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const userId = req.user.uid;

    // Get user's documents
    const userDocs = await Document.find({ userId }).select('_id status');
    const docIds = userDocs.map(d => d._id);

    const totalDocuments = userDocs.length;
    const processingDocuments = userDocs.filter(d => d.status === 'processing' || d.status === 'queued').length;
    const readyDocuments = userDocs.filter(d => d.status === 'ready').length;

    // Count API keys for user's documents
    const apiKeys = await ApiKey.countDocuments({ documentId: { $in: docIds }, revoked: false });

    // Count total API calls for user's documents
    const totalApiCalls = await ApiUsage.countDocuments({ documentId: { $in: docIds } });

    res.json({
      totalDocuments,
      processingDocuments,
      readyDocuments,
      apiKeys,
      totalApiCalls
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/usage/analytics — Full analytics data for Usage page
router.get('/analytics', async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { range = '30d' } = req.query;

    // Calculate date range
    const rangeMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = rangeMap[range] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user's document IDs
    const userDocs = await Document.find({ userId }).select('_id fileName');
    const docIds = userDocs.map(d => d._id);
    const docNameMap = {};
    userDocs.forEach(d => { docNameMap[d._id] = d.fileName || d._id; });

    // 1. API Calls Over Time (grouped by day)
    const callsByDay = await ApiUsage.aggregate([
      { $match: { documentId: { $in: docIds }, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days with 0
    const labels = [];
    const data = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      labels.push(dateStr);
      const found = callsByDay.find(c => c._id === dateStr);
      data.push(found ? found.count : 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 2. Requests Per Document
    const requestsByDoc = await ApiUsage.aggregate([
      { $match: { documentId: { $in: docIds }, createdAt: { $gte: startDate } } },
      { $group: { _id: '$documentId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 3. Success vs Error
    const successCount = await ApiUsage.countDocuments({
      documentId: { $in: docIds }, createdAt: { $gte: startDate }, success: true
    });
    const errorCount = await ApiUsage.countDocuments({
      documentId: { $in: docIds }, createdAt: { $gte: startDate }, success: false
    });

    // 4. Average Latency
    const latencyResult = await ApiUsage.aggregate([
      { $match: { documentId: { $in: docIds }, createdAt: { $gte: startDate } } },
      { $group: { _id: null, avgLatency: { $avg: '$latency' } } }
    ]);

    const totalCalls = successCount + errorCount;
    const avgLatency = latencyResult.length > 0 ? Math.round(latencyResult[0].avgLatency) : 0;
    const successRate = totalCalls > 0 ? parseFloat(((successCount / totalCalls) * 100).toFixed(1)) : 100;

    res.json({
      apiCallsOverTime: { labels, data },
      requestsPerDocument: {
        labels: requestsByDoc.map(r => docNameMap[r._id] || r._id),
        data: requestsByDoc.map(r => r.count)
      },
      errorVsSuccess: {
        success: successCount,
        error: errorCount
      },
      averageLatency: avgLatency,
      totalApiCalls: totalCalls,
      successRate
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
