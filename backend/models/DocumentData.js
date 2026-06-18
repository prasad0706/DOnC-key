const mongoose = require('mongoose');

const documentDataSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  data: {
    type: Object,
    required: true
  },
  embeddings: {
    type: [Number],
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for full-text search across summary and key points
documentDataSchema.index(
  { 'data.summary': 'text', 'data.extractedText': 'text' },
  { name: 'document_text_search', weights: { 'data.summary': 10, 'data.extractedText': 5 } }
);

const DocumentData = mongoose.model('DocumentData', documentDataSchema);

module.exports = DocumentData;