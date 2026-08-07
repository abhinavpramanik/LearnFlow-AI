const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateNo: { type: String, unique: true, trim: true },
    issuedAt: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    status: { type: String, enum: ['Active', 'Expired', 'Revoked'], default: 'Active', index: true },
  },
  { timestamps: true }
);

certificationSchema.index({ profileId: 1 });
certificationSchema.index({ certificateNo: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Certification', certificationSchema);
