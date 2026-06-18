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
    // 1. Get the document to check storage provider and file type
    const doc = await Document.findById(documentId);
    if (!doc) {
      throw new Error(`Document with ID ${documentId} not found in database`);
    }

    // 2. Load file buffer (local vs remote)
    let fileBuffer;
    if (doc.storageProvider === 'local') {
      logger.info('Reading local file', { documentId, path: doc.tempFilePath });
      const fs = require('fs').promises;
      fileBuffer = await fs.readFile(doc.tempFilePath);
    } else {
      logger.info('Downloading file from URL', { documentId, url: fileUrl?.substring(0, 50) });
      fileBuffer = await downloadFile(fileUrl);
    }

    let processedData;
    const modelName = doc.modelSelected || 'gemini-2.5-flash';

    if (isImageType(doc.fileType)) {
      // 3a. For images: Use Gemini Vision API directly
      logger.info('Analyzing image with Gemini Vision', { documentId, fileType: doc.fileType, model: modelName });
      processedData = await analyzeImage(fileBuffer, doc.fileType, doc.customSchema, modelName);
    } else {
      // 3b. For text/PDF: Extract text then generate summary
      const text = await extractText(fileBuffer, doc.fileType);
      logger.info('Text extracted', { documentId, length: text?.length });
      processedData = await generateDocumentSummary(text, doc.customSchema, modelName);
      processedData.extractedText = text;
    }

    // Generate text embeddings for vector search
    let textToEmbed = '';
    if (processedData.extractedText) {
      textToEmbed = processedData.extractedText;
    } else if (processedData.summary) {
      textToEmbed = processedData.summary;
    }

    let embeddings = null;
    if (textToEmbed) {
      logger.info('Generating vector embeddings', { documentId });
      const { generateEmbeddings } = require('./gemini');
      embeddings = await generateEmbeddings(textToEmbed);
    }

    // 4. Save processed data to MongoDB (upsert to handle retries/re-runs safely)
    await DocumentData.findOneAndUpdate(
      { documentId },
      { documentId, data: processedData, embeddings, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // 5. Update status to ready
    const updatedDoc = await Document.findByIdAndUpdate(documentId, {
      status: 'ready',
      processedAt: new Date(),
      updatedAt: new Date(),
      error: null
    }, { new: true });

    logger.info('Document processed successfully', { documentId });

    // Trigger Webhooks async
    triggerWebhooks(updatedDoc, 'document.ready', processedData);

    return { success: true, documentId };

  } catch (processError) {
    logger.error('Error processing document', {
      documentId,
      error: processError.message
    });

    const failedDoc = await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      error: processError.message,
      updatedAt: new Date()
    }, { new: true });

    // Trigger Webhooks async
    if (failedDoc) {
      triggerWebhooks(failedDoc, 'document.failed', { error: processError.message });
    }

    throw processError; // Re-throw to allow queue retry mechanism if needed
  }
}

/**
 * Dispatch webhooks to all registered active endpoints for a project.
 */
const Webhook = require('../models/Webhook');
const axios = require('axios');

async function triggerWebhooks(document, event, payloadData) {
  try {
    const webhooks = await Webhook.find({ 
      projectId: document.projectId,
      events: event,
      active: true 
    });

    if (webhooks.length === 0) return;

    logger.info('Dispatching webhooks', { documentId: document._id, event, count: webhooks.length });

    const payload = {
      event,
      documentId: document._id,
      fileName: document.fileName,
      status: document.status,
      timestamp: new Date(),
      data: payloadData
    };

    const promises = webhooks.map(webhook => {
      return axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DocumentIntelligencePlatform/1.0'
        },
        timeout: 5000
      }).catch(err => {
        logger.warn('Webhook delivery failed', { webhookId: webhook._id, url: webhook.url, error: err.message });
      });
    });

    await Promise.all(promises);
  } catch (error) {
    logger.error('Error in triggerWebhooks dispatch', { error: error.message });
  }
}

module.exports = {
  processDocument
};
