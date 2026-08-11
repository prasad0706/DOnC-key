const logger = require('./logger');

/**
 * Recursive Character Text Splitter
 * Recursively splits text using a list of natural separators (\n\n, \n, . , space, empty string)
 * to maintain semantic boundaries while targeting chunk size and overlap constraints.
 * 
 * @param {string} text - The input raw text to split
 * @param {object} options - Options including chunkSize (chars) and chunkOverlap (chars)
 * @returns {Array<{chunkIndex: number, text: string, startChar: number, endChar: number}>}
 */
function recursiveSplitText(text, options = {}) {
  if (!text || typeof text !== 'string') return [];

  const chunkSize = options.chunkSize || 1500;    // ~500 tokens
  const chunkOverlap = options.chunkOverlap || 150; // ~50 tokens
  const separators = options.separators || ['\n\n', '\n', '. ', ' ', ''];

  const cleanedText = text.trim();
  if (cleanedText.length <= chunkSize) {
    return [{
      chunkIndex: 0,
      text: cleanedText,
      startChar: 0,
      endChar: cleanedText.length
    }];
  }

  // Find appropriate separator
  function splitOnSeparator(inputStr, sepIndex) {
    if (sepIndex >= separators.length) {
      // Hard fallback chunking if no separator works
      const chunks = [];
      let start = 0;
      while (start < inputStr.length) {
        let end = start + chunkSize;
        chunks.push(inputStr.slice(start, end));
        start += chunkSize - chunkOverlap;
      }
      return chunks;
    }

    const sep = separators[sepIndex];
    const splits = sep === '' ? inputStr.split('') : inputStr.split(sep);
    const resultChunks = [];
    let currentChunk = [];
    let currentLen = 0;

    for (let i = 0; i < splits.length; i++) {
      const piece = splits[i];
      const pieceLen = piece.length + (sep !== '' ? sep.length : 0);

      if (pieceLen > chunkSize) {
        // Sub-split piece if it exceeds chunkSize
        if (currentChunk.length > 0) {
          resultChunks.push(currentChunk.join(sep));
          currentChunk = [];
          currentLen = 0;
        }
        const subPieces = splitOnSeparator(piece, sepIndex + 1);
        resultChunks.push(...subPieces);
        continue;
      }

      if (currentLen + pieceLen > chunkSize && currentChunk.length > 0) {
        const chunkText = currentChunk.join(sep);
        resultChunks.push(chunkText);
        
        // Calculate overlap elements
        let overlapLen = 0;
        const overlapPieces = [];
        for (let j = currentChunk.length - 1; j >= 0; j--) {
          const p = currentChunk[j];
          const pLen = p.length + (sep !== '' ? sep.length : 0);
          if (overlapLen + pLen <= chunkOverlap) {
            overlapPieces.unshift(p);
            overlapLen += pLen;
          } else {
            break;
          }
        }
        currentChunk = [...overlapPieces, piece];
        currentLen = overlapLen + pieceLen;
      } else {
        currentChunk.push(piece);
        currentLen += pieceLen;
      }
    }

    if (currentChunk.length > 0) {
      resultChunks.push(currentChunk.join(sep));
    }

    return resultChunks;
  }

  const rawChunks = splitOnSeparator(cleanedText, 0);
  const formattedChunks = [];
  let currentSearchPos = 0;

  rawChunks.forEach((chunkStr, idx) => {
    const trimmedChunk = chunkStr.trim();
    if (!trimmedChunk) return;

    const startPos = cleanedText.indexOf(trimmedChunk, currentSearchPos);
    const startChar = startPos !== -1 ? startPos : currentSearchPos;
    const endChar = startChar + trimmedChunk.length;
    currentSearchPos = Math.max(currentSearchPos, startChar + 1);

    formattedChunks.push({
      chunkIndex: idx,
      text: trimmedChunk,
      startChar,
      endChar
    });
  });

  logger.info('Text split into recursive chunks', {
    totalChars: cleanedText.length,
    chunkCount: formattedChunks.length,
    avgChunkLen: Math.round(cleanedText.length / Math.max(1, formattedChunks.length))
  });

  return formattedChunks;
}

module.exports = {
  recursiveSplitText
};
