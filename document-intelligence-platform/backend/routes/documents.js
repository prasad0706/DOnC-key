const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

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

    const documentId = `doc_${Date.now()}`;

    const doc = await Document.create({
      _id: documentId,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      status: 'queued'
    });

    res.status(201).json(doc);
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

module.exports = router;