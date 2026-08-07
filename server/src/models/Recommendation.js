const mongoose = require('mongoose');
const { RECOMMENDATION_STATUS } = require('../constants');

const recommendationSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
    recommendation: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, required: true },
    explanation: { type: String },
    modelVersion: { type: String },
    aiRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'AiRun' },
    status: {
      type: String,
      enum: Object.values(RECOMMENDATION_STATUS),
      default: RECOMMENDATION_STATUS.PENDING,
      index: true,
    },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

recommendationSchema.index({ profileId: 1, status: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
