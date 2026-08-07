const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    duration: { type: Number }, // in minutes
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], index: true },
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active' },
    instructor: { type: String, trim: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

courseSchema.pre(/^find/, function (next) {
  this.find({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Course', courseSchema);
