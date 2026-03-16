const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const DocumentData = require('../models/DocumentData');
const verifyToken = require('../middleware/auth');
const { chatWithDocument } = require('../utils/gemini');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');

// All chat routes require authentication
router.use(verifyToken);

// POST /api/documents/:id/chat — Ask a question about a document
router.post('/:id/chat', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, chatHistory } = req.body;

    if (!question || !question.trim()) {
      throw new ValidationError('Question is required');
    }

    // Verify document exists
    const document = await Document.findById(id);
    if (!document) {
      throw new NotFoundError('Document');
    }

    // Check document is processed
    if (document.status !== 'ready') {
      throw new ValidationError('Document is still being processed. Please wait until processing is complete.');
    }

    // Get the processed document data
    const docData = await DocumentData.findOne({ documentId: id });
    if (!docData) {
      throw new NotFoundError('Document data');
    }

    // Build the document text context from processed data
    const data = docData.data;
    let documentText = '';

    if (data.rawText) {
      documentText = data.rawText;
    } else if (data.extractedText) {
      documentText = data.extractedText;
    }

    // Also include the summary and key points for richer context
    if (data.summary) {
      documentText = `SUMMARY:\n${data.summary}\n\n` + documentText;
    }
    if (data.keyPoints && Array.isArray(data.keyPoints)) {
      documentText += `\n\nKEY POINTS:\n${data.keyPoints.join('\n- ')}`;
    }

    if (!documentText.trim()) {
      throw new ValidationError('No text content available for this document');
    }

    logger.info('Document chat request', { documentId: id, questionLength: question.length });

    const answer = await chatWithDocument(documentText, question, chatHistory || []);

    res.json({
      answer,
      documentId: id,
      question
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
