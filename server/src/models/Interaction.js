const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['Email', 'SMS', 'Web', 'Call', 'Chat'],
      required: true,
    },
    direction: {
      type: String,
      enum: ['Inbound', 'Outbound'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
    },
    intent: {
      type: String,
    },
    aiSummary: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

interactionSchema.index({ profileId: 1, createdAt: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
