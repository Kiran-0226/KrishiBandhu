const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },

    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market',
      required: true,
    },

    buyerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    buyerContact: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Bid', bidSchema);