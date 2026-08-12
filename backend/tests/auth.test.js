const crypto = require('crypto');

describe('API Key Generation & Timing-Safe Verification Logic', () => {
  test('generates API key formatted as prefix.secret', () => {
    const keyPrefix = `doc_${crypto.randomBytes(4).toString('hex')}`;
    const secretPart = crypto.randomBytes(24).toString('hex');
    const rawKey = `${keyPrefix}.${secretPart}`;

    expect(rawKey).toContain('.');
    expect(keyPrefix).toHaveLength(12);
    expect(rawKey.startsWith('doc_')).toBe(true);
  });

  test('verifies hash matching using crypto.timingSafeEqual', () => {
    const rawKey = `doc_1a2b3c4d.${crypto.randomBytes(24).toString('hex')}`;
    const incomingHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const storedHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const incomingBuffer = Buffer.from(incomingHash, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    const isMatch = incomingBuffer.length === storedBuffer.length &&
      crypto.timingSafeEqual(incomingBuffer, storedBuffer);

    expect(isMatch).toBe(true);
  });

  test('rejects mismatched hash buffers safely without throwing error', () => {
    const key1 = `doc_1a2b3c4d.${crypto.randomBytes(24).toString('hex')}`;
    const key2 = `doc_1a2b3c4d.${crypto.randomBytes(24).toString('hex')}`;

    const hash1Buffer = Buffer.from(crypto.createHash('sha256').update(key1).digest('hex'), 'hex');
    const hash2Buffer = Buffer.from(crypto.createHash('sha256').update(key2).digest('hex'), 'hex');

    const isMatch = hash1Buffer.length === hash2Buffer.length &&
      crypto.timingSafeEqual(hash1Buffer, hash2Buffer);

    expect(isMatch).toBe(false);
  });
});
