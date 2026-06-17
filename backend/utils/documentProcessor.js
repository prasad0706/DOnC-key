const Document = require('../models/Document');
const DocumentData = require('../models/DocumentData');
const { downloadFile, extractText, isImageType } = require('./fileProcessor');
const { generateDocumentSummary, analyzeImage } = require('./gemini');
const logger = require('./logger');

/**
 * Downloads a file from the provided URL, extracts text or analyzes it as an image,
 * queries Gemini using structured schemas, saves results to MongoDB, and updates
 * the document status.
 * 
 * @param {string} documentId - The document ID in the MongoDB collection
 * @param {string} fileUrl - The signed URL of the file in Firebase Storage
 */
async function processDocument(documentId, fileUrl) {
  logger.info('Processing document', { documentId });

  // Update status to processing
  await Document.findByIdAndUpdate(documentId, {
    status: 'processing',
    updatedAt: new Date()
  });

  try {
    // 1. Download file from Firebase URL
    logger.info('Downloading file', { documentId, url: fileUrl?.substring(0, 50) });
    const fileBuffer = await downloadFile(fileUrl);

    // 2. Get the document to check file type
    const doc = await Document.findById(documentId);
    if (!doc) {
      throw new Error(`Document with ID ${documentId} not found in database`);
    }

    let processedData;

    if (isImageType(doc.fileType)) {
      // 3a. For images: Use Gemini Vision API directly
      logger.info('Analyzing image with Gemini Vision', { documentId, fileType: doc.fileType });
      processedData = await analyzeImage(fileBuffer, doc.fileType);
    } else {
      // 3b. For text/PDF: Extract text then generate summary
      const text = await extractText(fileBuffer, doc.fileType);
      logger.info('Text extracted', { documentId, length: text?.length });
      processedData = await generateDocumentSummary(text);
      processedData.extractedText = text;
    }

    // 4. Save processed data to MongoDB (upsert to handle retries/re-runs safely)
    await DocumentData.findOneAndUpdate(
      { documentId },
      { documentId, data: processedData, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // 5. Update status to ready
    await Document.findByIdAndUpdate(documentId, {
      status: 'ready',
      processedAt: new Date(),
      updatedAt: new Date(),
      error: null
    });

    logger.info('Document processed successfully', { documentId });
    return { success: true, documentId };

  } catch (processError) {
    logger.error('Error processing document', {
      documentId,
      error: processError.message
    });

    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      error: processError.message,
      updatedAt: new Date()
    });

    throw processError; // Re-throw to allow queue retry mechanism if needed
  }
}

module.exports = {
  processDocument
};
