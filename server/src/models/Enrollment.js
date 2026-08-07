const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    completionStatus: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Failed'],
      default: 'Not Started',
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

enrollmentSchema.index({ profileId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
