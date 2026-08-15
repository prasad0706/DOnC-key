const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    events: {
      type: [String],
      enum: ['document.ready', 'document.failed'],
      default: ['document.ready', 'document.failed']
    },
    active: {
      type: Boolean,
      default: true
    },
    secret: {
      type: String,
      required: true,
      default: () => require('crypto').randomBytes(24).toString('hex')
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
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

const Webhook = mongoose.model('Webhook', webhookSchema);

module.exports = Webhook;
