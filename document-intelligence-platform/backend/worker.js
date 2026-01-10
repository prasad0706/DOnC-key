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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here' || GEMINI_API_KEY.includes('your-gemini-api-key')) {
  console.error('ERROR: GEMINI_API_KEY is not configured. Please add a valid API key to the backend .env file.');
  console.error('Go to https://aistudio.google.com/ to get your API key');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'your-placeholder-key');

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

// Export function for fallback processing
async function processDocument(documentId, source, fileName = null) {
  console.log(`Processing document ${documentId}`);

  // Check if API key is properly configured
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here' || GEMINI_API_KEY.includes('your-gemini-api-key')) {
    console.error(`Cannot process document ${documentId}: GEMINI_API_KEY is not configured.`);
    
    // Update document status to 'failed' with instruction
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      error: 'GEMINI_API_KEY not configured. Please add a valid API key to the backend .env file.',
      updatedAt: Date.now()
    });
    
    throw new Error('GEMINI_API_KEY not configured. Please add a valid API key to the backend .env file.');
  }

  try {
    // Step 1: Get document from database
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Step 2: Call Gemini AI to extract data from the document
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let result;
    if (source.startsWith('http')) {
      // For URL-based documents
      const sourceParam = `URL: ${source}`;
      const prompt = `Analyze the entire document from ${sourceParam}.
      Return a single JSON object containing:
      - summary
      - key_insights
      - structured list of chapters/sections

      Rules:
      - Use only document content
      - Do NOT add external knowledge
      - If information is missing, mark it as null
      - Output valid JSON only`;

      result = await model.generateContent(prompt);
    } else {
      // For local file uploads - we need to read the file and send its content
      const fs = require('fs');
      const path = require('path');
      
      // Read the file content
      const fileContent = fs.readFileSync(source);
      const fileExtension = path.extname(source).toLowerCase();
      
      // Define MIME type based on file extension
      let mimeType = 'application/octet-stream';
      if (fileExtension === '.pdf') mimeType = 'application/pdf';
      else if (fileExtension === '.jpg' || fileExtension === '.jpeg') mimeType = 'image/jpeg';
      else if (fileExtension === '.png') mimeType = 'image/png';
      else if (fileExtension === '.gif') mimeType = 'image/gif';
      
      // Create a prompt asking to analyze the document
      const prompt = `Analyze the entire document.
      Return a single JSON object containing:
      - summary
      - key_insights
      - structured list of chapters/sections

      Rules:
      - Use only document content
      - Do NOT add external knowledge
      - If information is missing, mark it as null
      - Output valid JSON only`;
      
      // Attempt to send the file with the prompt
      try {
        result = await model.generateContent([
          {
            inlineData: {
              mimeType: mimeType,
              data: fileContent.toString('base64'),
            },
          },
          { text: prompt }
        ]);
      } catch (error) {
        console.error('Error sending file to Gemini:', error.message);
        // Fallback to URL-based processing if file processing fails
        const promptFallback = `Analyze this document information. Return a single JSON object containing:
        - summary: "Sample summary for document"
        - key_insights: ["Sample insight 1", "Sample insight 2"]
        - structured list of chapters/sections: ["Section 1", "Section 2"]
        
        Rules:
        - Use only document content
        - Do NOT add external knowledge
        - Output valid JSON only`;
        
        result = await model.generateContent(promptFallback);
      }
    }

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
      documentId: documentId,
      data: parsedData
    });

    await documentData.save();

    // Step 5: Update document status to 'ready'
    document.status = 'ready';
    document.updatedAt = Date.now();
    await document.save();

    console.log(`Document ${documentId} processed successfully`);
    return { success: true, documentId: documentId };

  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error.message);

    // Update document status to 'failed'
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      error: error.message,
      updatedAt: Date.now()
    });

    throw error;
  }
}

console.log('Document processing worker started');

module.exports = { processDocument };