const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
let documentQueue;
let generateDocumentId;

// Function to initialize the router with the queue
function initializeRouter(queue, genDocIdFn) {
  documentQueue = queue;
  generateDocumentId = genDocIdFn;
  return router;
}

// GET ALL DOCUMENTS
router.get('/', async (req, res) => {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json(docs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// REGISTER DOCUMENT (FROM CLOUD URL)
router.post('/register', async (req, res) => {
  try {
    const { fileUrl, fileName, fileType, fileSize } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'fileUrl required' });
    }

    const documentId = generateDocumentId();

    await Document.create({
      _id: documentId,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      status: 'queued'
    });

    // Add to queue for processing
    await documentQueue.add('process-document', {
      documentId,
      fileUrl,
      fileName
    });

    res.status(202).json({
      processing_id: documentId,
      status: 'queued'
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Register failed' });
  }
});

// GET DOCUMENT BY ID
router.get('/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

module.exports = {
  initializeRouter
};