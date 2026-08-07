const mongoose = require('mongoose');
const { ROLES } = require('../constants');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      enum: Object.values(ROLES),
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

roleSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
