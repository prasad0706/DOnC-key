const axios = require('axios');
const pdf = require('pdf-parse');
const logger = require('./logger');

/**
 * Download a file from a URL and return the buffer.
 */
async function downloadFile(url) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });
    return response.data;
  } catch (error) {
    logger.error('Error downloading file', { error: error.message, url });
    throw new Error('Failed to download file');
  }
}

/**
 * Extract text from a file buffer based on its MIME type.
 * Supports: PDF, plain text, DOCX, XLSX, CSV, and images (via Gemini Vision).
 */
async function extractText(buffer, mimeType) {
  try {
    // PDF
    if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    }

    // Plain text
    if (mimeType.startsWith('text/')) {
      return buffer.toString('utf-8');
    }

    // DOCX
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      return result.value;
    }

    // XLSX
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const XLSX = require('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      let text = '';
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        text += `\n--- Sheet: ${sheetName} ---\n${csv}`;
      }
      return text.trim();
    }

    // CSV
    if (mimeType === 'text/csv' || mimeType === 'application/csv') {
      return buffer.toString('utf-8');
    }

    // Images are handled separately via Gemini Vision in the job processor
    if (mimeType.startsWith('image/')) {
      return null; // Signal that this needs image analysis instead
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    // Don't wrap already-thrown errors
    if (error.message.startsWith('Unsupported file type')) throw error;
    logger.error('Error extracting text', { error: error.message, mimeType });
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

/**
 * Check if a MIME type represents an image.
 */
function isImageType(mimeType) {
  return mimeType && mimeType.startsWith('image/');
}

module.exports = {
  downloadFile,
  extractText,
  isImageType
};
