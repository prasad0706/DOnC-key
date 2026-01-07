require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const firebaseAdmin = require('firebase-admin');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin initialization
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID !== 'your-firebase-project-id' &&
    process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_CLIENT_EMAIL !== 'your-firebase-client-email' &&
    process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY !== 'your-firebase-private-key' &&
    process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----') && process.env.FIREBASE_PRIVATE_KEY.includes('-----END PRIVATE KEY-----')) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
} else {
  console.log('Firebase not configured. Some features may not work.');
  // Initialize without credentials for development
  firebaseAdmin.initializeApp({
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

// MongoDB connection
if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb+srv://your-mongodb-connection-string') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('MongoDB not configured. Some features may not work.');
}

// Redis connection for BullMQ
let documentQueue;
if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://your-redis-connection-string') {
  const redisConnection = new IORedis(process.env.REDIS_URL);
  documentQueue = new Queue('documentProcessing', { connection: redisConnection });
} else {
  console.log('Redis not configured. Document processing queue will not be available.');
  // Create a mock queue for development
  documentQueue = {
    add: (name, data) => {
      console.log(`Mock queue: Processing document ${data.fileName} for user ${data.userId}`);
      return Promise.resolve();
    }
  };
}

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

// Authentication has been removed for development

// Routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Document Intelligence API is running' });
});

// Document upload endpoint
app.post('/api/documents/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Add document to processing queue with a mock user ID
    await documentQueue.add('processDocument', {
      userId: 'anonymous-user',
      fileName: req.file.originalname,
      fileBuffer: req.file.buffer,
      fileType: req.file.mimetype
    });

    res.status(202).json({
      message: 'Document uploaded and processing started',
      status: 'queued',
      documentName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
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
      console.error(err);
    }
  });
}

// Start the server with dynamic port assignment
startServer(PORT);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
