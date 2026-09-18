const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema(
  {
    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market',
      required: true,
    },

    commodity: {
      type: String,
      required: true,
      trim: true,
    },

    variety: {
      type: String,
      trim: true,
    },

    unit: {
      type: String,
      required: true,
      default: 'quintal',
      trim: true,
    },

    arrivalQuantity: {
      type: Number,
      min: 0,
    },

    minimumPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    maximumPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    modalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    priceDate: {
      type: Date,
      required: true,
    },

    source: {
      type: String,
      enum: [
        'MSAMB',
        'data.gov.in',
        'manual',
      ],
      default: 'MSAMB',
    },
  },
  {
    timestamps: true,
  }
);

const MarketPrice = mongoose.model(
  'MarketPrice',
  marketPriceSchema
);

module.exports = MarketPrice;