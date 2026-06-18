const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      index: true
    },
    endpoint: {
      type: String,
      required: true
    },
    method: {
      type: String,
      required: true
    },
    statusCode: {
      type: Number,
      required: true
    },
    latencyMs: {
      type: Number,
      required: true
    },
    ipAddress: {
      type: String
    },
    userId: {
      type: String,
      index: true
    }
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
  }
);

const ApiLog = mongoose.model('ApiLog', apiLogSchema);

module.exports = ApiLog;
