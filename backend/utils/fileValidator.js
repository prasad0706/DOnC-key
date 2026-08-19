const fs = require('fs');
const logger = require('./logger');

/**
 * Perform deep server-side magic byte inspection on a temporary file from disk.
 * 
 * @param {string} filePath - Absolute path to temporary uploaded file
 * @returns {object} { isValid: boolean, detectedType: string, error?: string }
 */
function validateFileMagicBytes(filePath) {
  if (!fs.existsSync(filePath)) {
    return { isValid: false, error: 'File path does not exist' };
  }

  let buffer;
  let bytesRead = 0;
  try {
    const fd = fs.openSync(filePath, 'r');
    buffer = Buffer.alloc(512);
    bytesRead = fs.readSync(fd, buffer, 0, 512, 0);
    fs.closeSync(fd);
  } catch (err) {
    if (logger && logger.error) {
      logger.error('Error reading magic bytes from file', { filePath, error: err.message });
    }
    return { isValid: false, error: 'Unable to inspect file header' };
  }

  if (bytesRead === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  // 1. Executable / Malicious binary checks
  // Windows PE (.exe, .dll, .sys, .bat disguised) - "MZ"
  if (buffer[0] === 0x4D && buffer[1] === 0x5A) {
    return { isValid: false, detectedType: 'application/x-msdownload', error: 'Executable binary files (MZ header) are forbidden' };
  }
  // Linux ELF binary - "\x7fELF"
  if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
    return { isValid: false, detectedType: 'application/x-executable', error: 'Linux ELF binary files are forbidden' };
  }
  // Mach-O / Java class binary - 0xCAFEBABE
  if (buffer[0] === 0xCA && buffer[1] === 0xFE && buffer[2] === 0xBA && buffer[3] === 0xBE) {
    return { isValid: false, detectedType: 'application/x-java-applet', error: 'Compiled binary applet files are forbidden' };
  }

  // 2. Allowed Document Magic Bytes
  // PDF: %PDF- (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { isValid: true, detectedType: 'application/pdf' };
  }

  // PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { isValid: true, detectedType: 'image/png' };
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { isValid: true, detectedType: 'image/jpeg' };
  }

  // GIF: GIF87a (0x47 0x49 0x46 0x38 0x37 0x61) or GIF89a (0x47 0x49 0x46 0x38 0x39 0x61)
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return { isValid: true, detectedType: 'image/gif' };
  }

  // Zip-based OpenXML (DOCX, XLSX): PK\x03\x04 (0x50 0x4B 0x03 0x04)
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return { isValid: true, detectedType: 'application/vnd.openxmlformats-officedocument' };
  }

  // 3. Plain Text / CSV Inspection
  // Check if buffer contains valid printable ASCII / UTF-8 text without null bytes or binary controls
  let isText = true;
  for (let i = 0; i < Math.min(bytesRead, 256); i++) {
    const byte = buffer[i];
    // Reject null bytes and low control characters except tab, LF, CR
    if (byte === 0 || (byte < 9 && byte !== 0) || (byte > 13 && byte < 32 && byte !== 27)) {
      isText = false;
      break;
    }
  }

  if (isText) {
    return { isValid: true, detectedType: 'text/plain' };
  }

  return { isValid: false, detectedType: 'unknown', error: 'Unrecognized or untrusted file header signature' };
}

module.exports = {
  validateFileMagicBytes
};
