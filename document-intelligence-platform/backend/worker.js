require('dotenv').config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Document = require('./models/Document');
const DocumentData = require('./models/DocumentData');
const crypto = require('crypto');

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

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key');

// Document processing worker
const worker = new Worker('documentProcessing', async job => {
  console.log(`Processing document ${job.data.documentId}`);

  try {
    // Step 1: Get document from database
    const document = await Document.findById(job.data.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Step 2: Determine how to process the document (URL or file path)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    let aiOutput;

    if (job.data.fileUrl) {
      // Processing a URL
      const prompt = `Analyze the entire document at this URL: ${job.data.fileUrl}.
      Return a single JSON object containing:
      - summary
      - key_insights
      - structured list of chapters/sections

      Rules:
      - Use only document content
      - Do NOT add external knowledge
      - If information is missing, mark it as null
      - Output valid JSON only`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      aiOutput = response.text();
    } else if (job.data.filePath) {
      // Processing a file path - read the file and process it
      const fs = require('fs');
      const mimeTypes = require('mime-types');
      const fileBuffer = fs.readFileSync(job.data.filePath);
      const mimeType = mimeTypes.lookup(job.data.fileName) || 'application/octet-stream';
      
      // Convert file to base64 for Gemini API
      const base64File = fileBuffer.toString('base64');
      
      const prompt = `Analyze the entire document provided.
      Return a single JSON object containing:
      - summary
      - key_insights
      - structured list of chapters/sections

      Rules:
      - Use only document content
      - Do NOT add external knowledge
      - If information is missing, mark it as null
      - Output valid JSON only`;
      
      // Use the file with Gemini
      const filePart = {
        inlineData: {
          data: base64File,
          mimeType: mimeType
        }
      };
      
      const result = await model.generateContent([prompt, filePart]);
      const response = await result.response;
      aiOutput = response.text();
    } else {
      throw new Error('Neither fileUrl nor filePath provided');
    }

    // Step 3: Parse and validate AI output
    let parsedData;
    try {
      // Clean up the AI response to extract JSON
      const jsonMatch = aiOutput.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return valid JSON');
      }

      parsedData = JSON.parse(jsonMatch[0]);

      // Basic validation
      if (!parsedData.summary && !parsedData.key_insights) {
        throw new Error('AI output missing required fields');
      }
    } catch (parseError) {
      console.error('Failed to parse AI output:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Step 4: Save extracted data to database
    const documentData = new DocumentData({
      documentId: job.data.documentId,
      data: parsedData
    });

    await documentData.save();

    // Step 5: Update document status to 'ready'
    document.status = 'ready';
    document.updatedAt = Date.now();
    await document.save();

    console.log(`Document ${job.data.documentId} processed successfully`);
    return { success: true, documentId: job.data.documentId };

  } catch (error) {
    console.error(`Error processing document ${job.data.documentId}:`, error.message);

    // Update document status to 'failed'
    await Document.findByIdAndUpdate(job.data.documentId, {
      status: 'failed',
      error: error.message,
      updatedAt: Date.now()
    });

    // Re-throw error to trigger retry
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