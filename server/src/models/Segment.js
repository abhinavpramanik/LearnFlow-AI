const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    audienceCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

segmentSchema.pre(/^find/, function (next) {
  this.find({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Segment', segmentSchema);
