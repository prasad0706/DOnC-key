require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('./models/Document');
const ApiKey = require('./models/ApiKey');
const DocumentData = require('./models/DocumentData');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow localhost for development
    if (origin.includes('localhost')) return callback(null, true);
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

// Redis connection for BullMQ
const redisConnection = new IORedis(process.env.REDIS_URL);
const documentQueue = new Queue('documentProcessing', { connection: redisConnection });

// Helper function to generate document ID
function generateDocumentId() {
  return 'doc_' + Math.floor(1000 + Math.random() * 9000);
}

// Helper function to generate API key
function generateApiKey() {
  return 'sk-live-' + crypto.randomBytes(16).toString('hex');
}

// Helper function to hash API key using SHA-256
function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// PHASE 1 — UPLOAD & QUEUE (ASYNC HAND-OFF)
// STEP 1 — Receive File URL (NO FILE UPLOADS HERE)
app.post('/api/documents/register', async (req, res) => {
  try {
    const { fileUrl } = req.body;

    // Validate URL format
    if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid file URL format' });
    }

    // Generate a documentId
    const documentId = generateDocumentId();

    // Insert a document record into MongoDB
    const document = new Document({
      _id: documentId,
      fileUrl,
      status: 'processing'
    });

    await document.save();

    // STEP 2 — Queue the Job (MANDATORY)
    await documentQueue.add('process-document', {
      documentId,
      fileUrl
    });

    // Return immediately - NEVER call Gemini here
    res.status(202).json({
      processing_id: documentId,
      status: 'queued'
    });

  } catch (error) {
    console.error('Document registration error:', error);
    res.status(500).json({ error: 'Failed to register document' });
  }
});

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

    // Generate a random API key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);

    // Store ONLY the hash
    const apiKeyRecord = new ApiKey({
      documentId,
      keyHash
    });

    await apiKeyRecord.save();

    // Return the API key ONCE (plaintext key MUST NEVER be stored)
    res.status(201).json({
      apiKey
    });

  } catch (error) {
    console.error('API key generation error:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// PHASE 4 — RETRIEVAL (THE PRODUCT)
// STEP 7 — Data Fetch API
app.get('/api/v1/data', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    // STEP 8 — Verification Logic (MANDATORY ORDER)
    // 1. Hash the provided API key
    const keyHash = hashApiKey(apiKey);

    // 2. Look up hash in MongoDB
    const apiKeyRecord = await ApiKey.findOne({ keyHash });
    if (!apiKeyRecord) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // 3. Resolve documentId
    const documentId = apiKeyRecord.documentId;

    // STEP 9 — Response
    // Fetch document data by documentId
    const documentData = await DocumentData.findOne({ documentId });

    if (!documentData) {
      return res.status(404).json({ error: 'Document data not found' });
    }

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

// Document upload endpoint
app.post('/api/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate a documentId
    const documentId = generateDocumentId();

    // Save file temporarily or process it
    // For this implementation, we'll store in a temporary location
    const tempFileName = `${documentId}_${req.file.originalname}`;
    const tempFilePath = path.join(__dirname, 'temp', tempFileName);
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'temp'))) {
      fs.mkdirSync(path.join(__dirname, 'temp'), { recursive: true });
    }
    
    // Write file buffer to temp location
    try {
      fs.writeFileSync(tempFilePath, req.file.buffer);
    } catch (fileError) {
      console.error('Error writing file:', fileError);
      return res.status(500).json({ error: 'Failed to save uploaded file' });
    }

    // Insert a document record into MongoDB
    const document = new Document({
      _id: documentId,
      fileUrl: tempFilePath, // Using tempFilePath as fileUrl since that's what the model expects
      status: 'processing'
    });

    try {
      await document.save();
    } catch (dbError) {
      console.error('Error saving document to DB:', dbError);
      // Clean up the temp file if DB save fails
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(500).json({ error: 'Failed to save document record' });
    }

    // Queue the Job for processing
    try {
      await documentQueue.add('process-document', {
        documentId,
        filePath: tempFilePath,
        fileName: req.file.originalname
      });
    } catch (queueError) {
      console.error('Error queuing document for processing:', queueError);
      // Update document status to failed if queueing fails
      await Document.findByIdAndUpdate(documentId, { status: 'failed', error: 'Failed to queue for processing' });
      return res.status(500).json({ error: 'Failed to queue document for processing' });
    }

    res.status(202).json({
      message: 'Document uploaded and processing started',
      status: 'queued',
      documentId: documentId,
      documentName: req.file.originalname
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Document Intelligence API is running' });
});

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

// Get single document endpoint
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
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
