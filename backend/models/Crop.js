const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    variety: {
      type: String,
      trim: true,
    },

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

    sowingDate: {
      type: Date,
    },

    expectedHarvestDate: {
      type: Date,
    },

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

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Crop = mongoose.model('Crop', cropSchema);

module.exports = Crop;