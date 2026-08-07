const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    score: { type: Number, min: 0, max: 100 },
    result: { type: String, enum: ['Pass', 'Fail', 'Pending'] },
    feedback: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
