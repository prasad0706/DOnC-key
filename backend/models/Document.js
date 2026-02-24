const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: false  // Making it not required since we use tempFilePath
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
    error: {
      type: String,
      default: null
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false // Optional for now to support legacy docs, but should be required for new ones
    }
  },
  {
    timestamps: true,
  }
);

// No need for manual timestamp updates since we're using timestamps: true
// Mongoose will automatically handle createdAt and updatedAt

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;