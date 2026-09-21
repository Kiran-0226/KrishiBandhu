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
     * ==========================================
     * BACKHAUL TRANSPORT
     * ==========================================
     *
     * Optional transport associated with this
     * Parchi.
     *
     * The actual transport details remain in the
     * Backhaul collection.
     *
     * This reference simply connects the two
     * modules.
     */
    backhaul: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Backhaul',
      default: null,
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
     * ==========================================
     * PAYMENT WORKFLOW
     * ==========================================
     *
     * Demo/manual payment system.
     *
     * No real payment gateway is used.
     *
     * Trader transfers money externally and
     * uploads proof of transfer.
     *
     * Farmer then confirms or rejects the proof.
     */

    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'bank_details_shared',
        'transfer_submitted',
        'verification_pending',
        'success',
        'rejected',
        'failed',
        'cancelled',
      ],
      default: 'pending',
    },

    /*
     * ==========================================
     * FARMER BANK DETAILS
     * ==========================================
     *
     * Demo payment information belonging to
     * the farmer.
     *
     * These fields should contain test/demo
     * information during development.
     */

    bankDetails: {
      bankName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: '',
      },

      accountHolderName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: '',
      },

      accountNumber: {
        type: String,
        trim: true,
        maxlength: 30,
        default: '',
      },

      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: 20,
        default: '',
      },

      upiId: {
        type: String,
        trim: true,
        maxlength: 100,
        default: '',
      },
    },

    /*
     * ==========================================
     * PAYMENT REFERENCE
     * ==========================================
     *
     * Internal KrishiBandhu payment reference.
     *
     * Example:
     * KB-PAY-2026-000001
     */
    paymentReference: {
      type: String,
      trim: true,
      default: '',
    },

    /*
     * ==========================================
     * TRADER TRANSFER DETAILS
     * ==========================================
     */

    transferDetails: {
      amount: {
        type: Number,
        min: 0,
        default: null,
      },

      transferredAt: {
        type: Date,
        default: null,
      },

      transferReference: {
        type: String,
        trim: true,
        maxlength: 150,
        default: '',
      },

      note: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
      },
    },

    /*
     * ==========================================
     * PAYMENT RECEIPT
     * ==========================================
     *
     * The trader uploads a screenshot/image/PDF
     * showing the external transfer.
     *
     * The application only stores the receipt
     * information. It does not verify the bank
     * transaction automatically.
     */

    paymentReceipt: {
      fileName: {
        type: String,
        trim: true,
        maxlength: 255,
        default: '',
      },

      fileUrl: {
        type: String,
        trim: true,
        default: '',
      },

      uploadedAt: {
        type: Date,
        default: null,
      },

      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },

      /*
       * Result of optional AI/OCR analysis.
       *
       * This does NOT mean the payment is verified.
       */
      aiVerification: {
        status: {
          type: String,
          enum: [
            'not_checked',
            'processing',
            'matched',
            'mismatch',
            'uncertain',
          ],
          default: 'not_checked',
        },

        extractedAmount: {
          type: Number,
          default: null,
        },

        extractedDate: {
          type: Date,
          default: null,
        },

        extractedReference: {
          type: String,
          trim: true,
          default: '',
        },

        notes: {
          type: String,
          trim: true,
          maxlength: 1000,
          default: '',
        },

        checkedAt: {
          type: Date,
          default: null,
        },
      },
    },

    /*
     * ==========================================
     * FARMER CONFIRMATION
     * ==========================================
     */

    farmerConfirmation: {
      status: {
        type: String,
        enum: [
          'pending',
          'confirmed',
          'rejected',
        ],
        default: 'pending',
      },

      confirmedAt: {
        type: Date,
        default: null,
      },

      confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },

      note: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
      },
    },

    /*
     * ==========================================
     * INTERNAL TRANSACTION
     * ==========================================
     *
     * This is only an internal KrishiBandhu
     * record of the settlement.
     *
     * It does NOT represent an actual bank
     * transaction performed by KrishiBandhu.
     */

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },

    /*
     * Optional general notes.
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
     * When farmer confirmed payment.
     */
    paidAt: {
      type: Date,
      default: null,
    },

    /*
     * When the complete trade was finalized.
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