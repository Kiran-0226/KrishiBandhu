const mongoose = require('mongoose');

const saleListingSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton'],
      default: 'quintal',
    },

    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market',
      required: true,
    },

    askingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: [
        'active',
        'sold',
        'cancelled',
        'expired',
      ],
      default: 'active',
    },

    listedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const SaleListing = mongoose.model(
  'SaleListing',
  saleListingSchema,
);

module.exports = SaleListing;