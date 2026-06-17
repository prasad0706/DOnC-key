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
      const { processDocument } = require('./documentProcessor');
      await processDocument(job.data.documentId, job.data.fileUrl);
    } catch (error) {
      logger.error('Error in fallback job processing', { error: error.message });
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