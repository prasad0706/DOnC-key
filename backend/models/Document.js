const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: false
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
      enum: ['queued', 'processing', 'ready', 'failed'],
      default: 'queued'
    },
    tempFilePath: {
      type: String,
      required: false
    },
    storageProvider: {
      type: String,
      enum: ['firebase', 'local'],
      default: 'firebase'
    },
    modelSelected: {
      type: String,
      default: 'gemini-2.5-flash'
    },
    customSchema: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false
    },
    userId: {
      type: String,
      required: false,
      index: true // Index for user-scoped queries
    }
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;