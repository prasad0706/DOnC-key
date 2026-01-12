const mongoose = require('mongoose');

const apiUsageSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  latency: {
    type: Number, // in milliseconds
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ApiUsage = mongoose.model('ApiUsage', apiUsageSchema);

module.exports = ApiUsage;