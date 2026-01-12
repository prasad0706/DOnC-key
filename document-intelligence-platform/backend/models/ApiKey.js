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
  revoked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;