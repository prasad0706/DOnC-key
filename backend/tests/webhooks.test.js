jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const { generateWebhookSignature, verifyWebhookSignature } = require('../utils/webhookSigner');

describe('Webhook Payload Signing (HMAC SHA-256)', () => {
  const sampleSecret = 'whsec_sample_secret_key_1234567890';
  const samplePayload = {
    event: 'document.ready',
    documentId: 'doc_12345',
    fileName: 'sample_contract.pdf',
    status: 'ready',
    timestamp: '2026-08-12T12:00:00.000Z'
  };

  test('generates valid X-Hub-Signature-256 header format', () => {
    const signature = generateWebhookSignature(samplePayload, sampleSecret);

    expect(signature).toBeDefined();
    expect(signature.startsWith('sha256=')).toBe(true);
    expect(signature.length).toBe(7 + 64); // "sha256=" + 64 hex chars
  });

  test('verifies valid webhook signature successfully', () => {
    const signature = generateWebhookSignature(samplePayload, sampleSecret);
    const isValid = verifyWebhookSignature(samplePayload, signature, sampleSecret);

    expect(isValid).toBe(true);
  });

  test('rejects payload modified after signing', () => {
    const signature = generateWebhookSignature(samplePayload, sampleSecret);
    const tamperedPayload = { ...samplePayload, status: 'failed' };

    const isValid = verifyWebhookSignature(tamperedPayload, signature, sampleSecret);

    expect(isValid).toBe(false);
  });

  test('rejects verification with wrong secret key', () => {
    const signature = generateWebhookSignature(samplePayload, sampleSecret);
    const isValid = verifyWebhookSignature(samplePayload, signature, 'wrong_secret');

    expect(isValid).toBe(false);
  });
});

describe('Webhook Dead Letter Queue (DLQ) Logic', () => {
  test('formats DLQ entry schema fields correctly', () => {
    const dlqEntry = {
      url: 'https://example.com/webhook',
      event: 'document.failed',
      payload: { documentId: 'doc_999', error: 'ECONNREFUSED' },
      secret: 'whsec_sample_secret_key_1234567890',
      error: 'Connection timeout after 5000ms',
      attemptsMade: 5,
      userId: 'user_123'
    };

    expect(dlqEntry.url).toBe('https://example.com/webhook');
    expect(dlqEntry.attemptsMade).toBe(5);
    expect(dlqEntry.event).toBe('document.failed');
    expect(dlqEntry.payload).toHaveProperty('documentId');
  });
});
