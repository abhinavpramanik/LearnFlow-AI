const mongoose = require('mongoose');
const { AI_FEATURES } = require('../constants');

const aiRunSchema = new mongoose.Schema(
  {
    feature: {
      type: String,
      enum: Object.values(AI_FEATURES),
      required: true,
      index: true,
    },
    promptVersion: { type: String, default: '1.0' },
    modelVersion: { type: String },
    inputSnapshot: { type: mongoose.Schema.Types.Mixed },
    output: { type: mongoose.Schema.Types.Mixed },
    confidence: { type: Number, min: 0, max: 1 },
    latencyMs: { type: Number },
    status: { type: String, enum: ['success', 'failure', 'partial'], default: 'success' },
    errorMessage: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

aiRunSchema.index({ feature: 1, createdAt: -1 });
aiRunSchema.index({ createdBy: 1 });

module.exports = mongoose.model('AiRun', aiRunSchema);
