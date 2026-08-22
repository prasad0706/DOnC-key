const Usage = require('../models/Usage');
const logger = require('./logger');

/**
 * Get current UTC date in YYYY-MM-DD format.
 */
function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Check whether a project has exceeded its daily usage limits/guardrails.
 * 
 * @param {string} projectId - MongoDB Project ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} Usage limit status object
 */
async function checkUsageLimits(projectId, userId) {
  const maxDocsPerDay = parseInt(process.env.MAX_DOCS_PER_DAY || '50', 10);
  const maxTokensPerDay = parseInt(process.env.MAX_TOKENS_PER_DAY || '100000', 10);

  const today = getTodayDateString();

  let usageRecord = null;
  try {
    if (Usage && typeof Usage.findOne === 'function') {
      usageRecord = await Usage.findOne({ projectId, date: today });
    }
  } catch (err) {
    if (logger && logger.error) {
      logger.error('Error fetching usage record', { projectId, error: err.message });
    }
  }

  const currentDocs = usageRecord ? usageRecord.documentCount : 0;
  const currentTokens = usageRecord ? usageRecord.tokenCount : 0;

  const remainingDocs = Math.max(0, maxDocsPerDay - currentDocs);
  const remainingTokens = Math.max(0, maxTokensPerDay - currentTokens);

  const allowed = currentDocs < maxDocsPerDay && currentTokens < maxTokensPerDay;

  // Calculate midnight UTC reset timestamp
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);

  return {
    allowed,
    date: today,
    currentDocs,
    maxDocsPerDay,
    remainingDocs,
    currentTokens,
    maxTokensPerDay,
    remainingTokens,
    resetAt: tomorrow
  };
}

/**
 * Increment daily usage counts for a project.
 * 
 * @param {string} projectId - MongoDB Project ID
 * @param {string} userId - User ID
 * @param {number} docDelta - Documents added
 * @param {number} tokenDelta - Tokens consumed
 * @param {number} apiDelta - API calls made
 */
async function incrementUsage(projectId, userId, docDelta = 0, tokenDelta = 0, apiDelta = 1) {
  const today = getTodayDateString();

  try {
    if (Usage && typeof Usage.findOneAndUpdate === 'function') {
      await Usage.findOneAndUpdate(
        { projectId, date: today },
        {
          $set: { userId },
          $inc: {
            documentCount: docDelta,
            tokenCount: tokenDelta,
            apiCalls: apiDelta
          }
        },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    if (logger && logger.error) {
      logger.error('Error incrementing usage record', { projectId, error: err.message });
    }
  }
}

module.exports = {
  getTodayDateString,
  checkUsageLimits,
  incrementUsage
};
