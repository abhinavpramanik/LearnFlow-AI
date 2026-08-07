const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    attachments: [
      {
        filename: { type: String },
        url: { type: String },
        mimeType: { type: String },
        size: { type: Number },
      },
    ],
    aiDraft: { type: Boolean, default: false },
    isInternal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ ticketId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
