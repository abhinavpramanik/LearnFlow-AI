const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema(
  {
    entityType: { type: String, required: true, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    decision: { type: String, enum: ['Approved', 'Rejected', 'Overridden'], required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

approvalSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('Approval', approvalSchema);
