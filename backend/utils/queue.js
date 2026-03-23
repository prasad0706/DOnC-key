const logger = require('./logger');

let documentQueue;

if (process.env.REDIS_URL) {
  // Use BullMQ with Redis
  const { Queue } = require('bullmq');
  const IORedis = require('ioredis');
  
  const redisConnection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  redisConnection.on('error', (err) => {
    logger.error('Redis Queue Connection Error:', { error: err.message });
  });

  documentQueue = new Queue('documentProcessing', {
    connection: redisConnection
  });
  
  logger.info('Initialized BullMQ Queue with Redis');
} else {
  // In-memory job queue (fallback when Redis is not available)
  logger.info('REDIS_URL not set. Using in-memory fallback queue.');
  const jobQueue = [];

  documentQueue = {
    add: async (name, data) => {
      const jobId = Math.random().toString();
      const job = {
        id: jobId,
        name,
        data,
        timestamp: Date.now()
      };

      jobQueue.push(job);
      logger.info('Job added to queue', { name, documentId: data.documentId });

      // Process the job asynchronously
      setTimeout(() => processJob(job), 100);

      return { id: jobId };
    }
  };
  
  /**
   * Process a document job — downloads file, extracts text or analyzes image,
   * generates AI summary, and stores results.
   */
  async function processJob(job) {
    if (job.name !== 'process-document') return;

    try {
      logger.info('Processing document', { documentId: job.data.documentId });

      const Document = require('../models/Document');
      const DocumentData = require('../models/DocumentData');
      const { downloadFile, extractText, isImageType } = require('./fileProcessor');
      const { generateDocumentSummary, analyzeImage } = require('./gemini');

      // Update status to processing
      await Document.findByIdAndUpdate(job.data.documentId, {
        status: 'processing',
        updatedAt: new Date()
      });

      try {
        // 1. Download file from Firebase URL
        logger.info('Downloading file', { documentId: job.data.documentId, url: job.data.fileUrl?.substring(0, 50) });
        const fileBuffer = await downloadFile(job.data.fileUrl);

        // 2. Get the document to check file type
        const doc = await Document.findById(job.data.documentId);

        let processedData;

        if (isImageType(doc.fileType)) {
          // 3a. For images: Use Gemini Vision API directly
          logger.info('Analyzing image with Gemini Vision', { documentId: job.data.documentId, fileType: doc.fileType });
          processedData = await analyzeImage(fileBuffer, doc.fileType);
        } else {
          // 3b. For text/PDF: Extract text then generate summary
          const text = await extractText(fileBuffer, doc.fileType);
          logger.info('Text extracted', { documentId: job.data.documentId, length: text?.length });
          processedData = await generateDocumentSummary(text);
          processedData.rawText = text.substring(0, 5000) + '...';
        }

        // 4. Save processed data to MongoDB
        await DocumentData.create({
          documentId: job.data.documentId,
          data: processedData
        });

        // 5. Update status to ready
        await Document.findByIdAndUpdate(job.data.documentId, {
          status: 'ready',
          processedAt: new Date(),
          updatedAt: new Date()
        });

        logger.info('Document processed successfully', { documentId: job.data.documentId });

      } catch (processError) {
        logger.error('Error processing document', {
          documentId: job.data.documentId,
          error: processError.message
        });

        await Document.findByIdAndUpdate(job.data.documentId, {
          status: 'failed',
          error: processError.message,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      logger.error('Error in job processing', { error: error.message });
    }
  }
}

// Helper function to generate document ID
function generateDocumentId() {
  return 'doc_' + Math.floor(1000 + Math.random() * 9000);
}

module.exports = {
  documentQueue,
  generateDocumentId
};