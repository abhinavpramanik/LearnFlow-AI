const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    skills: [
      {
        skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
        endorsedAt: { type: Date },
      },
    ],
    certifications: [
      {
        certificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certification' },
        issuedAt: { type: Date },
      },
    ],
    preferences: {
      learningStyle: { type: String },
      preferredChannels: [{ type: String }],
      language: { type: String, default: 'en' },
    },
    consent: {
      marketing: { type: Boolean, default: false },
      dataProcessing: { type: Boolean, default: true },
      aiRecommendations: { type: Boolean, default: true },
      updatedAt: { type: Date },
    },
    riskScore: {
      churn: { type: Number, min: 0, max: 1, default: 0 },
      propensity: { type: Number, min: 0, max: 1, default: 0 },
      updatedAt: { type: Date },
    },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

profileSchema.index({ userId: 1 }, { unique: true });
profileSchema.index({ department: 1 });
profileSchema.index({ deletedAt: 1 });

profileSchema.pre(/^find/, function (next) {
  this.find({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
