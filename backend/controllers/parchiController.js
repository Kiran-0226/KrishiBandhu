const Parchi = require('../models/Parchi');
const Bid = require('../models/Bid');
const SaleListing = require('../models/SaleListing');

/*
 * ==========================================
 * Generate Parchi Number
 * ==========================================
 *
 * Example:
 * KB-2026-000001
 */

const generateParchiNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Parchi.countDocuments({
    parchiNumber: {
      $regex: `^KB-${year}-`,
    },
  });

  const sequence = String(count + 1).padStart(
    6,
    '0',
  );

  return `KB-${year}-${sequence}`;
};


/*
 * ==========================================
 * Create Parchi
 * ==========================================
 *
 * Only the farmer who owns the accepted bid's
 * crop can generate the Parchi.
 */

const createParchi = async (req, res) => {
  try {
    const { bidId } = req.body;

    if (!bidId) {
      return res.status(400).json({
        success: false,
        message: 'Bid ID is required.',
      });
    }

    /*
     * Find the bid and populate the relationships
     * required to create the Parchi.
     */

    const bid = await Bid.findById(bidId)
      .populate('saleListing')
      .populate('buyer')
      .populate('crop')
      .populate('market');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found.',
      });
    }

    /*
     * Only the farmer who owns the crop can
     * generate the Parchi.
     */

    if (!bid.crop?.owner) {
      return res.status(400).json({
        success: false,
        message:
          'The crop owner could not be determined.',
      });
    }

    if (
      bid.crop.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You can only generate a Parchi for your own crop bids.',
      });
    }

    /*
     * Parchi can only be generated from an
     * accepted bid.
     */

    if (bid.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message:
          'Parchi can only be generated for an accepted bid.',
      });
    }

    /*
     * The accepted bid must have a sale listing.
     */

    if (!bid.saleListing) {
      return res.status(400).json({
        success: false,
        message:
          'This bid is not linked to a sale listing.',
      });
    }

    /*
     * Prevent duplicate Parchi creation.
     */

    const existingParchi = await Parchi.findOne({
      bid: bid._id,
    });

    if (existingParchi) {
      return res.status(409).json({
        success: false,
        message:
          'A Parchi has already been generated for this bid.',
        data: existingParchi,
      });
    }

    /*
     * Make sure the sale listing is still valid.
     */

    const saleListing = await SaleListing.findById(
      bid.saleListing._id,
    );

    if (!saleListing) {
      return res.status(404).json({
        success: false,
        message: 'Sale listing not found.',
      });
    }

    /*
     * Generate unique Parchi number.
     */

    const parchiNumber =
      await generateParchiNumber();

    /*
     * Create Parchi from trusted backend data.
     */

    const parchi = await Parchi.create({
      parchiNumber,

      bid: bid._id,

      saleListing: saleListing._id,

      farmer: bid.crop.owner,

      trader: bid.buyer._id,

      crop: bid.crop._id,

      market: bid.market._id,

      quantity: bid.quantity,

      unit: saleListing.unit,

      pricePerUnit: bid.pricePerUnit,

      totalAmount: bid.totalAmount,

      status: 'issued',

      paymentStatus: 'pending',

      issuedAt: new Date(),
    });

    /*
     * Return the complete Parchi with populated
     * references.
     */

    const populatedParchi =
      await Parchi.findById(parchi._id)
        .populate(
          'bid',
        )
        .populate(
          'saleListing',
        )
        .populate(
          'farmer',
          'name email phone location',
        )
        .populate(
          'trader',
          'name email phone location',
        )
        .populate(
          'crop',
        )
        .populate(
          'market',
        );

    return res.status(201).json({
      success: true,
      message: 'Parchi generated successfully.',
      data: populatedParchi,
    });
  } catch (error) {
    console.error(
      'Create Parchi Error:',
      error,
    );

    /*
     * Unique constraint protection.
     */

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          'A Parchi already exists for this bid.',
      });
    }

    return res.status(500).json({
      success: false,
      message:
        'Failed to generate Parchi.',
    });
  }
};


/*
 * ==========================================
 * Get Parchis
 * ==========================================
 *
 * Farmer:
 *   Parchis for their crops
 *
 * Trader:
 *   Parchis belonging to them
 *
 * Admin:
 *   All Parchis
 */

const getParchis = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'farmer') {
      filter.farmer = req.user._id;
    } else if (req.user.role === 'trader') {
      filter.trader = req.user._id;
    }

    const parchis = await Parchi.find(filter)
      .populate(
        'farmer',
        'name email phone location',
      )
      .populate(
        'trader',
        'name email phone location',
      )
      .populate(
        'crop',
      )
      .populate(
        'market',
      )
      .populate(
        'saleListing',
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: parchis.length,
      data: parchis,
    });
  } catch (error) {
    console.error(
      'Get Parchis Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch Parchis.',
    });
  }
};


/*
 * ==========================================
 * Get Parchi By ID
 * ==========================================
 */

const getParchiById = async (req, res) => {
  try {
    const parchi =
      await Parchi.findById(req.params.id)
        .populate(
          'bid',
        )
        .populate(
          'saleListing',
        )
        .populate(
          'farmer',
          'name email phone location',
        )
        .populate(
          'trader',
          'name email phone location',
        )
        .populate(
          'crop',
        )
        .populate(
          'market',
        );

    if (!parchi) {
      return res.status(404).json({
        success: false,
        message: 'Parchi not found.',
      });
    }

    /*
     * Access control:
     *
     * Admin → any Parchi
     * Farmer → own Parchis
     * Trader → own Parchis
     */

    const isAdmin =
      req.user.role === 'admin';

    const isFarmer =
      req.user.role === 'farmer' &&
      parchi.farmer?._id?.toString() ===
        req.user._id.toString();

    const isTrader =
      req.user.role === 'trader' &&
      parchi.trader?._id?.toString() ===
        req.user._id.toString();

    if (
      !isAdmin &&
      !isFarmer &&
      !isTrader
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not authorized to view this Parchi.',
      });
    }

    return res.status(200).json({
      success: true,
      data: parchi,
    });
  } catch (error) {
    console.error(
      'Get Parchi Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch Parchi.',
    });
  }
};


/*
 * ==========================================
 * Update Parchi Payment Status
 * ==========================================
 *
 * This will later be used by the payment
 * verification system.
 *
 * For now, only Admin is allowed to manually
 * update payment state.
 */

const updateParchiPaymentStatus = async (
  req,
  res,
) => {
  try {
    const {
      paymentStatus,
      paymentReference,
    } = req.body;

    const allowedStatuses = [
      'pending',
      'initiated',
      'success',
      'failed',
      'cancelled',
    ];

    if (
      !allowedStatuses.includes(
        paymentStatus,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid payment status.',
      });
    }

    const parchi =
      await Parchi.findById(
        req.params.id,
      );

    if (!parchi) {
      return res.status(404).json({
        success: false,
        message: 'Parchi not found.',
      });
    }

    parchi.paymentStatus =
      paymentStatus;

    if (
      paymentReference !== undefined
    ) {
      parchi.paymentReference =
        paymentReference;
    }

    if (
      paymentStatus === 'success'
    ) {
      parchi.paidAt = new Date();
      parchi.status = 'paid';
    }

    if (
      paymentStatus === 'failed'
    ) {
      parchi.status =
        'payment_pending';
    }

    await parchi.save();

    return res.status(200).json({
      success: true,
      message:
        'Parchi payment status updated.',
      data: parchi,
    });
  } catch (error) {
    console.error(
      'Update Parchi Payment Status Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to update payment status.',
    });
  }
};


module.exports = {
  createParchi,
  getParchis,
  getParchiById,
  updateParchiPaymentStatus,
};