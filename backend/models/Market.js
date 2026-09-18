const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      default: 'Maharashtra',
      trim: true,
    },

    type: {
      type: String,
      enum: [
        'APMC',
        'Sub-market',
        'Private Market',
        'Other',
      ],
      default: 'APMC',
    },

    location: {
      type: String,
      trim: true,
    },

    isOfficial: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String,
      enum: [
        'MSAMB',
        'user_submitted',
      ],
      default: 'MSAMB',
    },

    verificationStatus: {
      type: String,
      enum: [
        'verified',
        'pending',
        'rejected',
      ],
      default: 'verified',
    },
  },
  {
    timestamps: true,
  }
);

const Market = mongoose.model(
  'Market',
  marketSchema
);

module.exports = Market;