const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    category: { type: String, trim: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
