jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const { recursiveSplitText } = require('../utils/textSplitter');

describe('Recursive Character Text Splitter', () => {
  test('returns single chunk for short text under chunkSize', () => {
    const shortText = 'This is a short document text snippet.';
    const chunks = recursiveSplitText(shortText, { chunkSize: 500, chunkOverlap: 50 });
    
    expect(chunks).toHaveLength(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].text).toBe(shortText);
  });

  test('splits long text into multiple chunks maintaining size constraints', () => {
    const paragraph1 = 'Paragraph 1 '.repeat(50);
    const paragraph2 = 'Paragraph 2 '.repeat(50);
    const fullText = `${paragraph1}\n\n${paragraph2}`;

    const chunks = recursiveSplitText(fullText, { chunkSize: 200, chunkOverlap: 20 });
    
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk, idx) => {
      expect(chunk.chunkIndex).toBe(idx);
      expect(chunk.text.length).toBeLessThanOrEqual(250); // Allowing small boundary tolerance
      expect(typeof chunk.startChar).toBe('number');
      expect(typeof chunk.endChar).toBe('number');
    });
  });

  test('handles empty or null text gracefully', () => {
    expect(recursiveSplitText('')).toEqual([]);
    expect(recursiveSplitText(null)).toEqual([]);
    expect(recursiveSplitText(undefined)).toEqual([]);
  });
});
