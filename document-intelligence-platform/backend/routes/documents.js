const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// 🔥 FETCH DOCUMENTS (THIS IS THE CORE)
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (err) {
    console.error('FETCH DOCUMENTS ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// 🔥 REGISTER DOCUMENT (FOR TESTING)
router.post('/register', async (req, res) => {
  try {
    console.log('REGISTER BODY:', req.body);

    const doc = await Document.create({
      fileUrl: req.body.fileUrl || 'test',
      fileName: req.body.fileName || 'test.pdf',
      fileSize: req.body.fileSize || 0,
      fileType: req.body.fileType || 'pdf',
      status: 'ready',
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: 'Register failed' });
  }
});

// GET document by ID (for Open button)
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(doc);
  } catch (err) {
    console.error('GET document by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch document details' });
  }
});

module.exports = router;