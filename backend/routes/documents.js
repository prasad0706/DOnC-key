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

// Multer configuration for file uploads
const storage = multer.memoryStorage();
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

// POST /api/documents/upload — Upload a document (secured)
router.post('/upload', verifyToken, uploadLimiter, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required. Please select or create a project.' });
    }

    // Verify project belongs to user
    const project = await Project.findOne({ _id: projectId, userId: req.user.uid });
    if (!project) {
      throw new NotFoundError('Project');
    }

    const documentId = generateDocumentId();

    // Upload to Firebase Storage
    const fileName = `${documentId}_${req.file.originalname}`;
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    const file = bucket.file(cleanFileName);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          documentId: documentId,
          projectId: projectId,
          userId: req.user.uid
        }
      }
    });

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    });

    const document = new Document({
      _id: documentId,
      fileUrl: signedUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      tempFilePath: `gs://${bucket.name}/${cleanFileName}`,
      status: 'queued',
      projectId: projectId,
      userId: req.user.uid
    });

    await document.save();

    // Push to queue for processing
    await documentQueue.add('process-document', {
      documentId,
      fileUrl: signedUrl,
      storagePath: cleanFileName,
      fileName: req.file.originalname
    });

    logger.info('Document uploaded and queued', { documentId, projectId, userId: req.user.uid });

    res.status(202).json({
      message: 'Document uploaded and queued for processing',
      status: 'queued',
      documentId: documentId,
      documentName: req.file.originalname,
      fileUrl: signedUrl,
      projectId: projectId
    });
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

// GET /api/documents/search — Full-text search across processed documents
router.get('/search', verifyToken, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    // Get user's document IDs
    const userDocs = await Document.find({ userId: req.user.uid }).select('_id');
    const userDocIds = userDocs.map(d => d._id);

    // Text search on processed data
    const results = await DocumentData.find(
      { documentId: { $in: userDocIds }, $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(20);

    // Enrich with document metadata
    const enriched = await Promise.all(results.map(async (r) => {
      const doc = await Document.findById(r.documentId);
      return {
        documentId: r.documentId,
        fileName: doc?.fileName || r.documentId,
        status: doc?.status,
        score: r._doc.score,
        summary: r.data?.summary?.substring(0, 200) + '...',
        category: r.data?.category
      };
    }));

    res.json({ query: q, results: enriched, total: enriched.length });
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