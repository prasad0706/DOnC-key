const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    index: true
  },
  keyHash: {
    type: String,
    required: true,
    unique: true
  },
  keyPrefix: {
    type: String,
    required: true,
    index: true // Indexed for fast O(1) lookup instead of scanning all keys
  },
  revoked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient prefix + revoked queries
apiKeySchema.index({ keyPrefix: 1, revoked: 1 });

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;