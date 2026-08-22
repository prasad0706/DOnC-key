jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

jest.mock('../models/Usage', () => ({
  findOne: jest.fn().mockResolvedValue(null),
  findOneAndUpdate: jest.fn().mockResolvedValue({})
}));

const { getTodayDateString, checkUsageLimits } = require('../utils/usageGuard');

describe('Cost & Usage Guardrail Helper Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('formats today UTC date string correctly (YYYY-MM-DD)', () => {
    const dateStr = getTodayDateString();
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('calculates default usage limits and remaining quota correctly', async () => {
    process.env.MAX_DOCS_PER_DAY = '50';
    process.env.MAX_TOKENS_PER_DAY = '100000';

    const status = await checkUsageLimits('sample_project_123', 'user_123');

    expect(status.allowed).toBe(true);
    expect(status.maxDocsPerDay).toBe(50);
    expect(status.maxTokensPerDay).toBe(100000);
    expect(status.remainingDocs).toBe(50);
    expect(status.remainingTokens).toBe(100000);
    expect(status.resetAt).toBeInstanceOf(Date);
  });

  test('enforces custom environment guardrail limits', async () => {
    process.env.MAX_DOCS_PER_DAY = '10';
    process.env.MAX_TOKENS_PER_DAY = '5000';

    const status = await checkUsageLimits('sample_project_123', 'user_123');

    expect(status.maxDocsPerDay).toBe(10);
    expect(status.maxTokensPerDay).toBe(5000);
    expect(status.remainingDocs).toBe(10);
  });
});