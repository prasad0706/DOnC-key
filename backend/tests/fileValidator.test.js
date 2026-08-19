jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const fs = require('fs');
const path = require('path');
const { validateFileMagicBytes } = require('../utils/fileValidator');

describe('Deep Server-Side File Validation (Magic Byte Sniffing)', () => {
  const tempTestDir = path.join(__dirname, '../temp/test_magic_bytes');

  beforeAll(() => {
    if (!fs.existsSync(tempTestDir)) {
      fs.mkdirSync(tempTestDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tempTestDir)) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
  });

  test('validates genuine PDF file magic bytes (%PDF-)', () => {
    const filePath = path.join(tempTestDir, 'sample.pdf');
    const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // %PDF-1.4
    fs.writeFileSync(filePath, pdfHeader);

    const result = validateFileMagicBytes(filePath);
    expect(result.isValid).toBe(true);
    expect(result.detectedType).toBe('application/pdf');
  });

  test('validates genuine PNG image magic bytes', () => {
    const filePath = path.join(tempTestDir, 'sample.png');
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    fs.writeFileSync(filePath, pngHeader);

    const result = validateFileMagicBytes(filePath);
    expect(result.isValid).toBe(true);
    expect(result.detectedType).toBe('image/png');
  });

  test('validates genuine JPEG image magic bytes', () => {
    const filePath = path.join(tempTestDir, 'sample.jpg');
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
    fs.writeFileSync(filePath, jpegHeader);

    const result = validateFileMagicBytes(filePath);
    expect(result.isValid).toBe(true);
    expect(result.detectedType).toBe('image/jpeg');
  });

  test('validates Zip-based OpenXML (DOCX/XLSX) magic bytes (PK\\x03\\x04)', () => {
    const filePath = path.join(tempTestDir, 'sample.docx');
    const zipHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
    fs.writeFileSync(filePath, zipHeader);

    const result = validateFileMagicBytes(filePath);
    expect(result.isValid).toBe(true);
    expect(result.detectedType).toBe('application/vnd.openxmlformats-officedocument');
  });

  test('validates plain text and CSV files', () => {
    const filePath = path.join(tempTestDir, 'sample.csv');
    fs.writeFileSync(filePath, 'id,name,email\n1,Alice,alice@example.com\n2,Bob,bob@example.com');

    const result = validateFileMagicBytes(filePath);
    expect(result.isValid).toBe(true);
    expect(result.detectedType).toBe('text/plain');
  });

  test('rejects spoofed Windows executable (.exe MZ header disguised as .pdf)', () => {
    const filePath = path.join(tempTestDir, 'malicious_disguised.pdf');
    const exeHeader = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header
    fs.writeFileSync(filePath, exeHeader);

    const result = validateFileMagicBytes(filePath);
    expect(result.isValid).toBe(false);
    expect(result.detectedType).toBe('application/x-msdownload');
    expect(result.error).toContain('Executable binary files');
  });

  test('rejects Linux ELF binary headers disguised as .pdf', () => {
    const filePath = path.join(tempTestDir, 'malicious_elf.pdf');
    const elfHeader = Buffer.from([0x7F, 0x45, 0x4C, 0x46, 0x02, 0x01, 0x01, 0x00]); // \x7fELF
    fs.writeFileSync(filePath, elfHeader);

    const result = validateFileMagicBytes(filePath);
    expect(result.isValid).toBe(false);
    expect(result.detectedType).toBe('application/x-executable');
  });
});
