require('dotenv').config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('./models/Document');
const DocumentData = require('./models/DocumentData');
const crypto = require('crypto');

// Initialize Redis connection
const redisConnection = new IORedis(process.env.REDIS_URL);

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

    // Step 2: Call Gemini AI to extract data from the document
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    const aiOutput = response.text();

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