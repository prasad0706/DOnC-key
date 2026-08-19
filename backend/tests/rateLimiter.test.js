describe('Proactive Rate Limiting & Queue Limits (RPM Math)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('parses default GEMINI_MAX_RPM and window duration correctly', () => {
    const maxRpm = parseInt(process.env.GEMINI_MAX_RPM || '15', 10);
    const durationMs = parseInt(process.env.GEMINI_RPM_DURATION_MS || '60000', 10);

    expect(maxRpm).toBe(15);
    expect(durationMs).toBe(60000);
  });

  test('calculates minimum job execution interval accurately', () => {
    const maxRpm = 15;
    const durationMs = 60000;
    const minIntervalMs = Math.ceil(durationMs / maxRpm);

    expect(minIntervalMs).toBe(4000); // 4000ms per job for 15 RPM
  });

  test('configures custom RPM environment parameters', () => {
    process.env.GEMINI_MAX_RPM = '30';
    process.env.GEMINI_RPM_DURATION_MS = '60000';

    const maxRpm = parseInt(process.env.GEMINI_MAX_RPM, 10);
    const durationMs = parseInt(process.env.GEMINI_RPM_DURATION_MS, 10);
    const minIntervalMs = Math.ceil(durationMs / maxRpm);

    expect(maxRpm).toBe(30);
    expect(minIntervalMs).toBe(2000); // 2000ms per job for 30 RPM
  });
});
