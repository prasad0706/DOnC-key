const crypto = require('crypto');
const logger = require('./logger');

/**
 * Generate HMAC SHA-256 signature header for outgoing webhook payloads.
 * Format: sha256=<hex_digest>
 * 
 * @param {object|string} payload - Webhook JSON body or string
 * @param {string} secret - Shared secret key
 * @returns {string} Formatted signature header value
 */
function generateWebhookSignature(payload, secret) {
  if (!secret) return '';
  
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString);
  const digest = hmac.digest('hex');
  
  return `sha256=${digest}`;
}

/**
 * Verify incoming webhook signature against shared secret using constant-time comparison.
 * 
 * @param {object|string} payload - Webhook JSON body or string
 * @param {string} signatureHeader - Signature header value (X-Hub-Signature-256)
 * @param {string} secret - Shared secret key
 * @returns {boolean} True if signature matches
 */
function verifyWebhookSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;

  try {
    const expectedSignature = generateWebhookSignature(payload, secret);
    
    const expectedBuffer = Buffer.from(expectedSignature);
    const incomingBuffer = Buffer.from(signatureHeader);

    if (expectedBuffer.length !== incomingBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, incomingBuffer);
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error verifying webhook signature', { error: error.message });
    }
    return false;
  }
}

module.exports = {
  generateWebhookSignature,
  verifyWebhookSignature
};
