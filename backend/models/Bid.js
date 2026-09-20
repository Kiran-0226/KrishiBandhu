const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    /*
     * Sale Listing
     *
     * New marketplace bids should always be
     * connected to the listing they are bidding on.
     *
     * This is optional for backward compatibility
     * with older bids already stored in MongoDB.
     */
    saleListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SaleListing',
      default: null,
    },

    /*
     * Authenticated trader/buyer
     *
     * New bids will store the actual logged-in
     * user's ID instead of trusting buyer details
     * sent from the frontend.
     */
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

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

    /*
     * Kept for backward compatibility with
     * the existing bid records and UI.
     *
     * For new trader bids, these values will be
     * populated from the authenticated User.
     */
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
      enum: [
        'pending',
        'accepted',
        'rejected',
      ],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  'Bid',
  bidSchema,
);