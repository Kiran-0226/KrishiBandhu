const mongoose = require('mongoose');

const storageRequestSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    storageFacility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StorageFacility',
      required: true,
    },

    crop: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton'],
      required: true,
      default: 'kg',
    },

    quantityInKg: {
      type: Number,
      required: true,
      min: 0.01,
    },

    startDate: {
      type: Date,
      required: true,
    },

    durationMonths: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    estimatedMonthlyCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    estimatedTotalCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'completed',
      ],
      default: 'pending',
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const StorageRequest = mongoose.model(
  'StorageRequest',
  storageRequestSchema,
);

module.exports = StorageRequest;