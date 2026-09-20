const mongoose = require('mongoose');

const parchiSchema = new mongoose.Schema(
  {
    /*
     * Unique Parchi number
     *
     * Example:
     * KB-2026-000001
     */
    parchiNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /*
     * The accepted bid that created this Parchi.
     */
    bid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: true,
      unique: true,
    },

    /*
     * Sale listing associated with the transaction.
     */
    saleListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SaleListing',
      required: true,
    },

    /*
     * Farmer / seller.
     */
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    /*
     * Trader / buyer.
     */
    trader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    /*
     * Crop being sold.
     */
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },

    /*
     * Market where the crop is being sold.
     */
    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market',
      required: true,
    },

    /*
     * Crop quantity from the accepted bid.
     */
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    /*
     * Unit of measurement.
     */
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'ton'],
      required: true,
    },

    /*
     * Accepted price per unit.
     */
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * Final transaction amount.
     */
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * Parchi lifecycle.
     */
    status: {
      type: String,
      enum: [
        'issued',
        'payment_pending',
        'paid',
        'completed',
        'cancelled',
      ],
      default: 'issued',
    },

    /*
     * Payment status.
     *
     * This is intentionally separate from
     * the Parchi status because payment itself
     * will later have its own verification flow.
     */
    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'initiated',
        'success',
        'failed',
        'cancelled',
      ],
      default: 'pending',
    },

    /*
     * Future transaction reference.
     */
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },

    /*
     * Optional payment reference supplied by
     * the payment system later.
     */
    paymentReference: {
      type: String,
      trim: true,
      default: '',
    },

    /*
     * Optional notes.
     */
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    /*
     * When the Parchi was issued.
     */
    issuedAt: {
      type: Date,
      default: Date.now,
    },

    /*
     * When payment was completed.
     */
    paidAt: {
      type: Date,
      default: null,
    },

    /*
     * When the transaction was completed.
     */
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Parchi = mongoose.model(
  'Parchi',
  parchiSchema,
);

module.exports = Parchi;