const mongoose = require('mongoose');

const backhaulSchema =
  new mongoose.Schema(
    {
      farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },

      trader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },

      saleListing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SaleListing',
        default: null,
      },

      parchi: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parchi',
        default: null,
      },

      sourceMarket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Market',
        required: true,
      },

      destinationMarket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Market',
        required: true,
      },

      transportType: {
        type: String,
        enum: [
          'own',
          'trader',
        ],
        required: true,
      },

      vehicleNumber: {
        type: String,
        trim: true,
        uppercase: true,
      },

      vehicleType: {
        type: String,
        trim: true,
      },

      driverName: {
        type: String,
        trim: true,
      },

      driverPhone: {
        type: String,
        trim: true,
      },

      /* ======================================
         TOTAL VEHICLE CAPACITY
      ====================================== */

      capacity: {
        type: Number,
        min: 0,
        required: true,
      },

      capacityUnit: {
        type: String,
        enum: [
          'kg',
          'quintal',
          'ton',
        ],
        default: 'ton',
      },

      /* ======================================
         CURRENT AVAILABLE CAPACITY
      ====================================== */

      availableCapacity: {
        type: Number,
        min: 0,
        required: true,
      },

      /* ======================================
         FARMER ALLOCATION
      ====================================== */

      allocatedQuantity: {
        type: Number,
        min: 0,
        default: 0,
      },

      allocatedQuantityUnit: {
        type: String,
        enum: [
          'kg',
          'quintal',
          'ton',
        ],
        default: 'kg',
      },

      farmerTransportCost: {
        type: Number,
        min: 0,
        default: 0,
      },

      /* ======================================
         DEPARTURE
      ====================================== */

      departureDate: {
        type: Date,
        required: true,
      },

      departureTime: {
        type: String,
        trim: true,
      },

      estimatedDistanceKm: {
        type: Number,
        min: 0,
        default: null,
      },

      /* ======================================
         COST
      ====================================== */

      estimatedCost: {
        type: Number,
        min: 0,
        required: true,
      },

      costUnit: {
        type: String,
        enum: [
          'total',
          'per_kg',
          'per_quintal',
          'per_ton',
        ],
        default: 'total',
      },

      /* ======================================
         OTHER DETAILS
      ====================================== */

      notes: {
        type: String,
        trim: true,
      },

      status: {
        type: String,
        enum: [
          'available',
          'selected',
          'confirmed',
          'completed',
          'cancelled',
        ],
        default: 'available',
      },

      selectedAt: {
        type: Date,
        default: null,
      },

      confirmedAt: {
        type: Date,
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    },
  );

/* ==========================================
   INDEXES
========================================== */

backhaulSchema.index({
  sourceMarket: 1,
  destinationMarket: 1,
  status: 1,
});

backhaulSchema.index({
  departureDate: 1,
  status: 1,
});

backhaulSchema.index({
  trader: 1,
  status: 1,
});

backhaulSchema.index({
  farmer: 1,
  createdAt: -1,
});

/* ==========================================
   MODEL
========================================== */

const Backhaul =
  mongoose.model(
    'Backhaul',
    backhaulSchema,
  );

module.exports =
  Backhaul;