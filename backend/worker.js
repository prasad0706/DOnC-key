require('dotenv').config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Worker: Connected to MongoDB'))
  .catch(err => {
    console.error('Worker: MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize Redis connection
const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Test Redis connection
redisConnection.ping().then(() => {
  console.log('Worker: Connected to Redis successfully');
}).catch(err => {
  console.error('Worker: Redis connection error:', err);
});

const { processDocument } = require('./utils/documentProcessor');

// Document processing worker
const worker = new Worker('documentProcessing', async job => {
  console.log(`Processing document ${job.data.documentId}`);

  try {
    await processDocument(job.data.documentId, job.data.fileUrl);
    console.log(`Document ${job.data.documentId} processed successfully`);
    return { success: true, documentId: job.data.documentId };
  } catch (error) {
    console.error(`Error processing document ${job.data.documentId}:`, error.message);
    // Re-throw error to trigger BullMQ retry
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 1, // Process one document at a time
  removeOnComplete: {
    count: 100 // Keep last 100 completed jobs
  },
  removeOnFail: {
    count: 100 // Keep last 100 failed jobs
  }
});

// Error handling
worker.on('error', err => {
  console.error('Worker error:', err);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log('Document processing worker started');