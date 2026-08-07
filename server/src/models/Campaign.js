const mongoose = require('mongoose');
const { CAMPAIGN_STATUS } = require('../constants');

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true, index: true },
    channels: [{ type: String, enum: ['Email', 'SMS', 'Push', 'In-App'] }],
    status: {
      type: String,
      enum: Object.values(CAMPAIGN_STATUS),
      default: CAMPAIGN_STATUS.DRAFT,
      index: true,
    },
    schedule: { type: Date },
    frequency: {
      type: String,
      enum: ['Once', 'Daily', 'Weekly', 'Monthly'],
      default: 'Once',
    },
    message: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date },
    completedAt: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

campaignSchema.pre(/^find/, function (next) {
  this.find({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
