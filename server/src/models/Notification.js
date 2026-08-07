const mongoose = require('mongoose');
const { NOTIFICATION_SEVERITY } = require('../constants');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: Object.values(NOTIFICATION_SEVERITY),
      default: NOTIFICATION_SEVERITY.INFO,
    },
    read: { type: Boolean, default: false, index: true },
    entityType: { type: String },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
