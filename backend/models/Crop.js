const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    // ==========================================
    // Crop Owner
    // ==========================================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ==========================================
    // Crop Information
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    variety: {
      type: String,
      trim: true,
    },

    // ==========================================
    // Farm Area
    // ==========================================

    area: {
      type: Number,
      required: true,
      min: 0,
    },

    areaUnit: {
      type: String,
      enum: ['acre', 'hectare', 'gunta'],
      default: 'acre',
    },

    // ==========================================
    // Crop Dates
    // ==========================================

    sowingDate: {
      type: Date,
    },

    expectedHarvestDate: {
      type: Date,
    },

    // ==========================================
    // Crop Status
    // ==========================================

    status: {
      type: String,
      enum: [
        'planned',
        'growing',
        'ready',
        'harvested',
      ],
      default: 'planned',
    },

    // ==========================================
    // Additional Notes
    // ==========================================

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Crop = mongoose.model(
  'Crop',
  cropSchema,
);

module.exports = Crop;