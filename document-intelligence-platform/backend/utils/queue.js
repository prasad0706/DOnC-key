const { Queue } = require('bullmq');
const IORedis = require('ioredis');

let documentQueue;

try {
  // Try to initialize Redis connection
  const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
  
  documentQueue = new Queue('document processing', { connection: redisConnection });
} catch (error) {
  console.warn('Redis not available, using mock queue for demo');
  
  // Simple mock queue for demo purposes
  documentQueue = {
    add: async (name, data) => {
      console.log('Mock queue: Processing document', data.documentId);
      // Simulate immediate processing
      // In a real scenario, this would trigger the worker
      return { id: Math.random().toString() };
    }
  };
}

// Helper function to generate document ID
function generateDocumentId() {
  return 'doc_' + Math.floor(1000 + Math.random() * 9000);
}

module.exports = {
  documentQueue,
  generateDocumentId
};