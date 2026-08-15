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

// Webhook delivery worker
const axios = require('axios');
const { generateWebhookSignature } = require('./utils/webhookSigner');

const webhookWorker = new Worker('webhookDelivery', async job => {
  const { url, payload, secret } = job.data;
  console.log(`Worker: Delivering webhook event "${payload.event}" to ${url}`);

  const signatureHeader = generateWebhookSignature(payload, secret);

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'DOnC-key-Platform/1.0'
  };

  if (signatureHeader) {
    headers['X-Hub-Signature-256'] = signatureHeader;
  }

  await axios.post(url, payload, {
    headers,
    timeout: 5000
  });

  console.log(`Worker: Webhook successfully signed & delivered to ${url}`);
  return { success: true, url };
}, {
  connection: redisConnection,
  concurrency: 5, // Dispatch up to 5 webhooks concurrently
  removeOnComplete: {
    count: 100
  },
  removeOnFail: {
    count: 100
  }
});

webhookWorker.on('error', err => {
  console.error('Webhook Worker error:', err);
});

webhookWorker.on('failed', (job, err) => {
  console.error(`Webhook Job ${job?.id} failed to deliver to ${job?.data?.url}:`, err.message);
});

console.log('Webhook delivery worker started');