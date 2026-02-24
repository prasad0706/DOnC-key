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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DocumentData = mongoose.model('DocumentData', documentDataSchema);

module.exports = DocumentData;