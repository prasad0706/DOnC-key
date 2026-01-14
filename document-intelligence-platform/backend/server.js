require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mime = require('mime-types');
const Document = require('./models/Document');
const ApiKey = require('./models/ApiKey');
const DocumentData = require('./models/DocumentData');
const ApiUsage = require('./models/ApiUsage');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  // Check if already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  }
  console.log('Firebase Admin initialized locally');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

const bucket = admin.storage().bucket();

const app = express();
const PORT = process.env.PORT || 5000;

// Skip Redis entirely for demo and use mock queue directly
const jobQueue = [];

const documentQueue = {
  add: async (name, data) => {
    const jobId = Math.random().toString();
    const job = {
      id: jobId,
      name,
      data,
      timestamp: Date.now()
    };

    jobQueue.push(job);
    console.log(`Job added to queue: ${name} for document ${data.documentId}`);

    // Process the job asynchronously
    setTimeout(() => processJob(job), 100);

    return { id: jobId };
  }
};

// Job processor function (simulates what worker.js would do)
async function processJob(job) {
  if (job.name === 'process-document') {
    try {
      console.log(`Processing document ${job.data.documentId}`);

      const Document = require('./models/Document');
      const DocumentData = require('./models/DocumentData');

      // Update status to processing
      await Document.findByIdAndUpdate(job.data.documentId, {
        status: 'processing',
        updatedAt: new Date()
      });

      console.log(`Document ${job.data.documentId} status updated to processing`);

      // Simulate processing delay
      setTimeout(async () => {
        try {
          // In a real system, this would call Gemini here
          // For demo, we'll create mock processed data
          const mockProcessedData = {
            rawText: `Mock processed content for document ${job.data.documentId}. This simulates the result of AI processing.`,
            summary: `Summary of document ${job.data.documentId}`,
            keyPoints: [`Key point 1 from ${job.data.documentId}`, `Key point 2 from ${job.data.documentId}`]
          };

          // Save processed data
          await DocumentData.create({
            documentId: job.data.documentId,
            data: mockProcessedData
          });

          // Update status to ready
          await Document.findByIdAndUpdate(job.data.documentId, {
            status: 'ready',
            processedAt: new Date(),
            updatedAt: new Date()
          });

          console.log(`Document ${job.data.documentId} processed successfully and marked as ready`);
        } catch (processError) {
          console.error(`Error processing document ${job.data.documentId}:`, processError);

          // Update status to failed
          await Document.findByIdAndUpdate(job.data.documentId, {
            status: 'failed',
            error: processError.message,
            updatedAt: new Date()
          });
        }
      }, 3000); // Simulate processing time
    } catch (error) {
      console.error('Error in job processing:', error);
    }
  }
}

// Initialize Express app

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow localhost for development
    if (origin.includes('localhost')) return callback(null, true);
    // Allow production domain
    if (origin === 'https://d-on-c-key.vercel.app') return callback(null, true);
        if (origin === 'https://d-on-c-key-git-prasad-prasad070606-2627s-projects.vercel.app') return callback(null, true);

    // For production, you would add your production domain here
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
    }
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Helper function to generate document ID
function generateDocumentId() {
  return 'doc_' + Math.floor(1000 + Math.random() * 9000);
}

// Helper function to generate API key
function generateApiKey() {
  return 'sk-live-' + crypto.randomBytes(16).toString('hex');
}



// PHASE 1 — UPLOAD & QUEUE (ASYNC HAND-OFF)


// PHASE 3 — SECURITY (API KEY CEREMONY)
// STEP 6 — Generate API Key (USER-ACTION)
app.post('/api/documents/:documentId/api-keys', async (req, res) => {
  try {
    const { documentId } = req.params;

    // Check if document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if document is ready
    if (document.status !== 'ready') {
      return res.status(400).json({ error: 'Document not ready' });
    }

    // Generate a random API key
    const rawKey = `doc_${crypto.randomBytes(24).toString('hex')}`;

    // Hash it with bcrypt
    const keyHash = await bcrypt.hash(rawKey, 10);

    // Store ONLY the hash
    const apiKeyRecord = new ApiKey({
      documentId,
      keyHash
    });

    await apiKeyRecord.save();

    // Return the API key ONCE (plaintext key MUST NEVER be stored)
    res.status(201).json({
      apiKey: rawKey,
      message: 'Store this key securely. It will not be shown again.'
    });

  } catch (error) {
    console.error('API key generation error:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// GET API keys for a specific document
app.get('/api/documents/:documentId/api-keys', async (req, res) => {
  try {
    const { documentId } = req.params;

    // Check if document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Find all API keys for this document
    const apiKeys = await ApiKey.find({ documentId });

    // Format the response
    const formattedKeys = apiKeys.map(key => ({
      id: key._id,
      documentId: key.documentId,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
      revoked: key.revoked || false
    }));

    res.json(formattedKeys);

  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ error: 'Failed to retrieve API keys' });
  }
});

// PHASE 4 — RETRIEVAL (THE PRODUCT)
// STEP 7 — Data Fetch API
app.get('/api/v1/data', async (req, res) => {
  const startTime = Date.now();

  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      const usageRecord = new ApiUsage({
        documentId: null,
        endpoint: req.originalUrl,
        success: false,
        latency: Date.now() - startTime
      });
      await usageRecord.save();

      return res.status(401).json({ error: 'API key required' });
    }

    // Find all non-revoked API keys
    const keys = await ApiKey.find({ revoked: false });

    let matchedKey = null;
    for (const key of keys) {
      const isMatch = await bcrypt.compare(apiKey, key.keyHash);
      if (isMatch) {
        matchedKey = key;
        break;
      }
    }

    if (!matchedKey) {
      const usageRecord = new ApiUsage({
        documentId: null,
        endpoint: req.originalUrl,
        success: false,
        latency: Date.now() - startTime
      });
      await usageRecord.save();

      return res.status(403).json({ error: 'Invalid API key' });
    }

    const documentId = matchedKey.documentId;

    // Fetch document data by documentId
    const documentData = await DocumentData.findOne({ documentId });

    if (!documentData) {
      const usageRecord = new ApiUsage({
        documentId,
        endpoint: req.originalUrl,
        success: false,
        latency: Date.now() - startTime
      });
      await usageRecord.save();

      return res.status(404).json({ error: 'Document data not found' });
    }

    // Record successful usage
    const usageRecord = new ApiUsage({
      documentId,
      endpoint: req.originalUrl,
      success: true,
      latency: Date.now() - startTime
    });
    await usageRecord.save();

    // Return JSON exactly as stored - NO modification, NO AI calls here
    res.json({
      documentId,
      data: documentData.data
    });

  } catch (error) {
    console.error('Data retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve document data' });
  }
});

// API key verification middleware
async function verifyApiKey(req, res, next) {
  const startTime = Date.now();
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    const usageRecord = new ApiUsage({
      documentId: null,
      endpoint: req.originalUrl,
      success: false,
      latency: Date.now() - startTime
    });
    await usageRecord.save();

    return res.status(401).json({ error: 'API key required' });
  }

  const keys = await ApiKey.find({ revoked: false });

  let matchedKey = null;
  for (const key of keys) {
    const isMatch = await bcrypt.compare(apiKey, key.keyHash);
    if (isMatch) {
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey) {
    const usageRecord = new ApiUsage({
      documentId: null,
      endpoint: req.originalUrl,
      success: false,
      latency: Date.now() - startTime
    });
    await usageRecord.save();

    return res.status(403).json({ error: 'Invalid API key' });
  }

  req.documentId = matchedKey.documentId;

  // Record successful usage
  const usageRecord = new ApiUsage({
    documentId: req.documentId,
    endpoint: req.originalUrl,
    success: true,
    latency: Date.now() - startTime
  });
  await usageRecord.save();

  return next();
}

// Protected data extraction endpoint
app.get('/api/extract/:documentId', verifyApiKey, async (req, res) => {
  if (req.params.documentId !== req.documentId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const data = await DocumentData.findOne({
    documentId: req.documentId
  });

  if (!data) {
    return res.status(404).json({ error: 'No data found' });
  }

  res.json(data.data);
});

// Document upload endpoint
// Document upload endpoint
app.post('/api/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate a documentId
    const documentId = generateDocumentId();

    // Upload to Firebase Storage
    const fileName = `${documentId}_${req.file.originalname}`;
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, ''); // Basic sanitization
    const file = bucket.file(cleanFileName);

    try {
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            originalName: req.file.originalname,
            documentId: documentId
          }
        }
      });

      // Make the file public or get a signed URL
      // For this implementation, we will generate a long-lived signed URL
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Long expiration date
      });

      // Insert a document record into MongoDB
      const document = new Document({
        _id: documentId,
        fileUrl: signedUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        tempFilePath: `gs://${bucket.name}/${cleanFileName}`, // Store GS path as reference
        status: 'queued'
      });

      await document.save();

      // Push to queue for processing
      await documentQueue.add('process-document', {
        documentId,
        fileUrl: signedUrl,
        storagePath: cleanFileName, // Pass storage path for worker if needed
        fileName: req.file.originalname
      });

      res.status(202).json({
        message: 'Document uploaded to Firebase and queued for processing',
        status: 'queued',
        documentId: documentId,
        documentName: req.file.originalname,
        fileUrl: signedUrl
      });

    } catch (uploadError) {
      console.error('Error uploading to Firebase or saving document:', uploadError);
      return res.status(500).json({ error: 'Failed to upload document to storage' });
    }

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Document Intelligence API is running' });
});

// Use documents routes


// Get all documents endpoint
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Document status check endpoint
app.get('/api/documents/:documentId/status', async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      documentId: document._id,
      status: document.status,
      error: document.error || null
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check document status' });
  }
});

// Endpoint to clean up documents with invalid paths
app.delete('/api/admin/cleanup-documents', async (req, res) => {
  try {
    const Document = require('./models/Document');
    const documents = await Document.find({ status: 'processing' });

    let cleanedCount = 0;
    for (const doc of documents) {
      if (doc.tempFilePath && !require('fs').existsSync(doc.tempFilePath)) {
        // Delete document record
        await Document.findByIdAndDelete(doc._id);
        cleanedCount++;

        // Try to remove temp file reference if it exists in current path
        const path = require('path');
        const currentTempPath = path.join(__dirname, 'temp', path.basename(doc.tempFilePath));
        if (require('fs').existsSync(currentTempPath)) {
          require('fs').unlinkSync(currentTempPath);
        }
      }
    }

    res.json({ message: `Cleaned up ${cleanedCount} invalid documents` });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup documents' });
  }
});

// Use documents routes
const documentsRoutes = require('./routes/documents');
app.use('/api/documents', documentsRoutes.initializeRouter(documentQueue, generateDocumentId));

// Endpoint to clear all documents (for debugging)
app.delete('/api/admin/clear-all-documents', async (req, res) => {
  try {
    const Document = require('./models/Document');
    const result = await Document.deleteMany({});

    // Clean up temp directory
    const fs = require('fs');
    const path = require('path');
    const tempDir = path.join(__dirname, 'temp');

    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
    }

    res.json({ message: `Cleared ${result.deletedCount} documents and cleaned temp directory` });
  } catch (error) {
    console.error('Clear all error:', error);
    res.status(500).json({ error: 'Failed to clear documents' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Function to start server with dynamic port assignment
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${parseInt(port) + 1}...`);
      if (port < PORT + 10) { // Try up to 10 ports
        setTimeout(() => {
          startServer(parseInt(port) + 1);
        }, 1000);
      } else {
        console.error(`Could not find an available port after trying ${PORT} through ${PORT + 10}`);
      }
    } else {
      console.error('Server error:', err);
    }
  });
}

// Start the server with dynamic port assignment
startServer(PORT);

console.log('Document Intelligence API Server starting...');
