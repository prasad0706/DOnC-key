const mongoose = require('mongoose');

const webhookDLQSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    event: {
      type: String,
      required: true
    },
    payload: {
      type: Object,
      required: true
    },
    secret: {
      type: String
    },
    error: {
      type: String
    },
    attemptsMade: {
      type: Number,
      default: 1
    },
    replayed: {
      type: Boolean,
      default: false
    },
    replayedAt: {
      type: Date
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    userId: {
      type: String,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const WebhookDLQ = mongoose.model('WebhookDLQ', webhookDLQSchema);

module.exports = WebhookDLQ;
