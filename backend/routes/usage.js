const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { checkUsageLimits } = require('../utils/usageGuard');

// GET /api/usage — Get daily cost & usage metrics for a project
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const usageLimits = await checkUsageLimits(projectId, req.user.uid);
    res.json(usageLimits);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
