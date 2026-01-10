const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: false // Not required for local file uploads
  },
  fileName: {
    type: String,
    required: false
  },
  fileType: {
    type: String,
    required: false
  },
  fileSize: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  error: {
    type: String,
    default: null
  },
  tempFilePath: {
    type: String,
    required: false
  }
});

documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;