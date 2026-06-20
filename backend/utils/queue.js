const logger = require('./logger');

let documentQueue;
let webhookQueue;

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
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10000 // 10s base delay for LLM rate limits
      }
    }
  });

  webhookQueue = new Queue('webhookDelivery', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000 // 5s base delay for downstream server drops
      }
    }
  });
  
  logger.info('Initialized BullMQ Queues with Redis');
} else {
  // In-memory job queues (fallback when Redis is not available)
  logger.info('REDIS_URL not set. Using in-memory fallback queues.');
  const docJobQueue = [];

  documentQueue = {
    add: async (name, data) => {
      const jobId = Math.random().toString();
      const job = {
        id: jobId,
        name,
        data,
        timestamp: Date.now()
      };

      docJobQueue.push(job);
      logger.info('Document Job added to fallback queue', { name, documentId: data.documentId });

      setTimeout(() => processDocJob(job), 100);
      return { id: jobId };
    }
  };

  webhookQueue = {
    add: async (name, data) => {
      const jobId = Math.random().toString();
      const job = {
        id: jobId,
        name,
        data,
        timestamp: Date.now()
      };

      logger.info('Webhook Job added to fallback queue', { url: data.url });
      setTimeout(() => processWebhookJob(job), 100);
      return { id: jobId };
    }
  };
  
  async function processDocJob(job) {
    if (job.name !== 'process-document') return;

    try {
      const { processDocument } = require('./documentProcessor');
      await processDocument(job.data.documentId, job.data.fileUrl);
    } catch (error) {
      logger.error('Error in fallback doc job processing', { error: error.message });
    }
  }

  async function processWebhookJob(job) {
    try {
      const axios = require('axios');
      await axios.post(job.data.url, job.data.payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DOnC-key-Platform/1.0'
        },
        timeout: 5000
      });
      logger.info('Fallback Webhook delivered successfully', { url: job.data.url });
    } catch (error) {
      logger.error('Error in fallback webhook job processing', { url: job.data.url, error: error.message });
    }
  }
}

// Helper function to generate document ID
function generateDocumentId() {
  return 'doc_' + Math.floor(1000 + Math.random() * 9000);
}

module.exports = {
  documentQueue,
  webhookQueue,
  generateDocumentId
};