const mongoose = require('mongoose');

const storageFacilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    type: {
      type: String,
      enum: ['cold_storage', 'warehouse'],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    location: {
      address: {
        type: String,
        trim: true,
        default: '',
      },

      village: {
        type: String,
        trim: true,
        default: '',
      },

      district: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
        default: 'Maharashtra',
      },

      pincode: {
        type: String,
        trim: true,
        default: '',
      },

      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    capacity: {
      type: Number,
      required: true,
      min: 0,
    },

    capacityUnit: {
      type: String,
      enum: ['kg', 'quintal', 'ton'],
      default: 'ton',
    },

    availableCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    suitableCrops: [
      {
        type: String,
        trim: true,
      },
    ],

    temperatureRange: {
      type: String,
      trim: true,
      default: '',
    },

    storageCharges: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },

      unit: {
        type: String,
        trim: true,
        default: 'per ton/month',
      },
    },

    contact: {
      phone: {
        type: String,
        trim: true,
        default: '',
      },

      alternatePhone: {
        type: String,
        trim: true,
        default: '',
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
      },
    },

    operatingHours: {
      type: String,
      trim: true,
      default: '9:00 AM - 6:00 PM',
    },

    facilities: [
      {
        type: String,
        trim: true,
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String,
      trim: true,
      default: 'KrishiBandhu',
    },
  },
  {
    timestamps: true,
  },
);

const StorageFacility = mongoose.model(
  'StorageFacility',
  storageFacilitySchema,
);

module.exports = StorageFacility;