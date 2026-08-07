const mongoose = require('mongoose');
const { JOURNEY_STAGES } = require('../constants');

const journeySchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
      index: true,
    },
    stage: {
      type: String,
      enum: Object.values(JOURNEY_STAGES),
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold', 'Cancelled'],
      default: 'Active',
      index: true,
    },
    relatedRecord: {
      entityType: { type: String },
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

journeySchema.index({ profileId: 1, stage: 1 });
journeySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Journey', journeySchema);
