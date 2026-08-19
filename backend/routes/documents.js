const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document');
const DocumentData = require('../models/DocumentData');
const Project = require('../models/Project');
const verifyToken = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { validate, documentSchemas, paramSchemas } = require('../middleware/validators');
const { bucket } = require('../config/firebase');
const { documentQueue, generateDocumentId } = require('../utils/queue');
const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');

const fsSync = require('fs');
const path = require('path');

// Ensure temporary upload directory exists for Multer disk storage (prevents RAM exhaustion)
const uploadTempDir = path.join(__dirname, '../temp/uploads_tmp');
if (!fsSync.existsSync(uploadTempDir)) {
  fsSync.mkdirSync(uploadTempDir, { recursive: true });
}

// Multer diskStorage configuration (stream uploads directly to disk instead of V8 RAM memoryStorage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadTempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, ''));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/gif',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // XLSX
      'text/csv',
      'application/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported: PDF, DOCX, XLSX, CSV, JPG, PNG, GIF.'), false);
    }
  }
});

const { validateFileMagicBytes } = require('../utils/fileValidator');

// POST /api/documents/upload — Upload document(s) (secured)
router.post('/upload', verifyToken, uploadLimiter, upload.array('document', 10), async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Perform Deep Server-Side File Validation (Magic Byte Sniffing)
    for (const file of files) {
      const validation = validateFileMagicBytes(file.path);
      if (!validation.isValid) {
        // Immediately purge invalid/spoofed temporary file from disk
        if (fsSync.existsSync(file.path)) {
          fsSync.unlinkSync(file.path);
        }
        logger.warn('Deep File Validation Failed', { fileName: file.originalname, error: validation.error });
        return res.status(400).json({
          error: `Security error: File content magic bytes failed validation. ${validation.error || ''}`
        });
      }
    }

    const { projectId, modelSelected, customSchema } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required. Please select or create a project.' });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: projectId, userId: req.user.uid });
    if (!project) {
      throw new NotFoundError('Project');
    }

    const fs = require('fs').promises;
    const results = [];

    for (const file of files) {
      const documentId = generateDocumentId();
      let fileUrl = '';
      let storagePath = '';
      let storageProvider = 'firebase';
      let localFilePath = '';

      // STORAGE SELECTION ARCHITECTURE:
      // Production: Cloud Object Storage (Firebase Storage / AWS S3) ensures stateless API & Worker containers.
      // Development Fallback: Single-node local disk (/backend/temp) allows offline testing without cloud billing.
      const useLocalOnly = process.env.STORAGE_PROVIDER === 'local';

      try {
        if (!useLocalOnly) {
          try {
            // Primary: Stream upload directly from disk path to Cloud Storage (Firebase Storage / S3)
            const fileName = `${documentId}_${file.originalname}`;
            const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');

            await bucket.upload(file.path, {
              destination: cleanFileName,
              metadata: {
                contentType: file.mimetype,
                metadata: {
                  originalName: file.originalname,
                  documentId: documentId,
                  projectId: projectId,
                  userId: req.user.uid
                }
              }
            });

            const firebaseFile = bucket.file(cleanFileName);
            const [signedUrl] = await firebaseFile.getSignedUrl({
              action: 'read',
              expires: '03-09-2491'
            });

            fileUrl = signedUrl;
            storagePath = `gs://${bucket.name}/${cleanFileName}`;
            storageProvider = 'firebase';
          } catch (fbError) {
            logger.warn('Cloud storage upload failed (or credentials unconfigured). Falling back to single-node local storage.', {
              error: fbError.message,
              note: 'In multi-container production setups, use Firebase/S3 or shared volume mounts for workers.'
            });
            storageProvider = 'local';
          }
        } else {
          storageProvider = 'local';
        }

        if (storageProvider === 'local') {
          // Handle local storage by moving/copying uploaded disk file to temp destination
          const tempDir = path.join(__dirname, '../temp');
          await fs.mkdir(tempDir, { recursive: true });

          const fileName = `${documentId}_${file.originalname}`;
          const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
          localFilePath = path.join(tempDir, cleanFileName);

          await fs.copyFile(file.path, localFilePath);

          // Serve URL statically from express
          const baseUrl = process.env.VITE_API_BASE_URL 
            ? process.env.VITE_API_BASE_URL.replace('/api', '') 
            : 'http://localhost:5000';
          fileUrl = `${baseUrl}/uploads/${cleanFileName}`;
          storagePath = localFilePath; // Save the absolute local file path
        }
      } finally {
        // Clean up temporary Multer upload artifact from disk to prevent storage leaks
        try {
          await fs.unlink(file.path);
        } catch (cleanupErr) {
          // Ignore if already moved/removed
        }
      }

      // Parse customSchema if it was passed
      let parsedSchema = null;
      if (customSchema) {
        try {
          parsedSchema = typeof customSchema === 'string' ? JSON.parse(customSchema) : customSchema;
        } catch (e) {
          logger.warn('Failed to parse custom schema', { error: e.message });
        }
      }

      const document = new Document({
        _id: documentId,
        fileUrl: fileUrl,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        tempFilePath: storagePath,
        storageProvider: storageProvider,
        modelSelected: modelSelected || 'gemini-2.5-flash',
        customSchema: parsedSchema,
        status: 'queued',
        projectId: projectId,
        userId: req.user.uid
      });

      await document.save();

      // Push to queue for processing
      await documentQueue.add('process-document', {
        documentId,
        fileUrl: fileUrl,
        storagePath: storagePath,
        fileName: file.originalname
      });

      logger.info('Document uploaded and queued', { documentId, projectId, userId: req.user.uid, storageProvider });

      results.push({
        message: 'Document uploaded and queued for processing',
        status: 'queued',
        documentId: documentId,
        documentName: file.originalname,
        fileUrl: fileUrl,
        projectId: projectId,
        storageProvider
      });
    }

    // Return array if multiple files, or just single object for backwards compatibility
    if (files.length === 1) {
      res.status(202).json(results[0]);
    } else {
      res.status(202).json({
        message: `${results.length} documents uploaded and queued for processing`,
        uploads: results
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/documents/register — Register a document from cloud URL
router.post('/register', verifyToken, validate(documentSchemas.register), async (req, res, next) => {
  try {
    const { fileUrl, fileName, fileType, fileSize } = req.body;

    const documentId = generateDocumentId();

    await Document.create({
      _id: documentId,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      status: 'queued',
      userId: req.user.uid
    });

    await documentQueue.add('process-document', {
      documentId,
      fileUrl,
      fileName
    });

    logger.info('Document registered and queued', { documentId, userId: req.user.uid });

    res.status(202).json({
      processing_id: documentId,
      status: 'queued'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents — List documents for the current user
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/search — Full-text and semantic search across processed documents
router.get('/search', verifyToken, async (req, res, next) => {
  try {
    const { q, type = 'text' } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    // Get user's document IDs
    const userDocs = await Document.find({ userId: req.user.uid }).select('_id');
    const userDocIds = userDocs.map(d => d._id);

    let results = [];
    let searchMethod = 'text';

    if (type === 'semantic') {
      try {
        const { generateEmbeddings } = require('../utils/gemini');
        const queryVector = await generateEmbeddings(q);
        
        if (queryVector) {
          // Attempt Atlas Vector Search across chunk vectors or document embeddings
          results = await DocumentData.aggregate([
            {
              $vectorSearch: {
                index: "vector_index",
                path: "chunks.embedding",
                queryVector: queryVector,
                numCandidates: 100,
                limit: 20
              }
            },
            {
              $match: {
                documentId: { $in: userDocIds }
              }
            },
            {
              $project: {
                documentId: 1,
                data: 1,
                chunks: 1,
                score: { $meta: "vectorSearchScore" }
              }
            }
          ]);
          searchMethod = 'semantic';
        }
      } catch (err) {
        logger.warn('Atlas Vector Search failed, falling back to full-text search', { error: err.message });
        results = await DocumentData.find(
          { documentId: { $in: userDocIds }, $text: { $search: q } },
          { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } }).limit(20);
        searchMethod = 'text-fallback';
      }
    } else {
      results = await DocumentData.find(
        { documentId: { $in: userDocIds }, $text: { $search: q } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).limit(20);
    }

    // Enrich with document metadata and relevant chunk snippet
    const enriched = await Promise.all(results.map(async (r) => {
      const doc = await Document.findById(r.documentId);
      const score = searchMethod === 'semantic' ? r.score : (r._doc ? r._doc.score : r.score);
      const snippet = r.chunks && r.chunks.length > 0
        ? r.chunks[0].text.substring(0, 200) + '...'
        : (r.data?.summary?.substring(0, 200) + '...');

      return {
        documentId: r.documentId,
        fileName: doc?.fileName || r.documentId,
        status: doc?.status,
        score: score || 1.0,
        summary: snippet,
        chunkCount: r.chunks ? r.chunks.length : 0,
        category: r.data?.category
      };
    }));

    res.json({ 
      query: q, 
      searchMethod, 
      results: enriched, 
      total: enriched.length 
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id/export — Export processed document data
router.get('/:id/export', verifyToken, async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    const docData = await DocumentData.findOne({ documentId: req.params.id });
    if (!docData) {
      throw new NotFoundError('Document data');
    }

    if (format === 'csv') {
      const data = docData.data;
      let csv = 'Field,Value\n';
      csv += `Summary,"${(data.summary || '').replace(/"/g, '""')}"\n`;
      csv += `Category,"${data.category || ''}"\n`;
      csv += `Sentiment,"${data.sentiment || ''}"\n`;
      if (data.keyPoints) {
        data.keyPoints.forEach((kp, i) => {
          csv += `KeyPoint_${i + 1},"${kp.replace(/"/g, '""')}"\n`;
        });
      }
      if (data.entities) {
        data.entities.forEach((e, i) => {
          csv += `Entity_${i + 1},"${e.replace(/"/g, '""')}"\n`;
        });
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="document_${req.params.id}.csv"`);
      return res.send(csv);
    }

    // Default: JSON
    res.setHeader('Content-Disposition', `attachment; filename="document_${req.params.id}.json"`);
    res.json(docData.data);
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id — Get document by ID
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      throw new NotFoundError('Document');
    }

    const docData = await DocumentData.findOne({ documentId: req.params.id });

    res.json({
      ...doc.toObject(),
      processingResult: docData ? docData.data : null
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id/status — Check document processing status
router.get('/:id/status', async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      throw new NotFoundError('Document');
    }

    res.json({
      documentId: document._id,
      status: document.status,
      error: document.error || null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;