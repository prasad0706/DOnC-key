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
      fileUrl: tempFilePath, // Store the temp file path
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      tempFilePath: tempFilePath,
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

    // Process the document immediately instead of queuing
    try {
      // Initialize Google Generative AI with your API key
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Read the file content
      const fileBuffer = fs.readFileSync(tempFilePath);
      const mimeType = req.file.mimetype;
      
      // Prepare file part for Gemini
      const filePart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType
        }
      };
      
      // Generate content using the file
      const prompt = "Analyze this document and provide a detailed summary, key points, and insights:";
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              filePart
            ]
          }
        ]
      });
      const response = await result.response;
      const aiOutput = response.text();
      
      // Update document status to ready and save AI output
      await Document.findByIdAndUpdate(documentId, { 
        status: 'ready',
        processedAt: new Date()
      });
      
      // Save the processed data
      const documentData = new DocumentData({
        documentId: documentId,
        extractedText: aiOutput,
        analysis: aiOutput
      });
      await documentData.save();
      
    } catch (processError) {
      console.error('Error processing document:', processError);
      // Update document status to failed if processing fails
      await Document.findByIdAndUpdate(documentId, { 
        status: 'failed', 
        error: processError.message || 'Failed to process document with AI' 
      });
    }

    res.status(200).json({
      message: 'Document uploaded and processed',
      status: 'processed',
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
app.use('/api/documents', require('./routes/documents'));

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

// Start the server on a fixed port
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

console.log('Document Intelligence API Server starting...');
