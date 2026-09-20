const SaleListing = require('../models/SaleListing');
const Crop = require('../models/Crop');

// GET /api/sale-listings
const getSaleListings = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'farmer') {
      filter.farmer = req.user._id;
    } else if (req.user.role === 'trader') {
      filter.status = 'active';
    }

    const listings = await SaleListing.find(filter)
      .populate({
        path: 'crop',
        select: 'name variety area areaUnit sowingDate expectedHarvestDate status',
      })
      .populate({
        path: 'farmer',
        select: 'name phone email location',
      })
      .populate({
        path: 'market',
        select: 'name district state type location isOfficial source verificationStatus',
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error('Get sale listings error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch sale listings',
    });
  }
};

// GET /api/sale-listings/:id
const getSaleListingById = async (req, res) => {
  try {
    const listing = await SaleListing.findById(req.params.id)
      .populate({
        path: 'crop',
        select: 'name variety area areaUnit sowingDate expectedHarvestDate status',
      })
      .populate({
        path: 'farmer',
        select: 'name phone email location',
      })
      .populate({
        path: 'market',
        select: 'name district state type location isOfficial source verificationStatus',
      });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Sale listing not found',
      });
    }

    // Farmers can only access their own listings.
    if (
      req.user.role === 'farmer' &&
      listing.farmer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this listing',
      });
    }

    // Traders can only access active listings.
    if (
      req.user.role === 'trader' &&
      listing.status !== 'active'
    ) {
      return res.status(404).json({
        success: false,
        message: 'Sale listing is not available',
      });
    }

    res.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Get sale listing by ID error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch sale listing',
    });
  }
};

// POST /api/sale-listings
const createSaleListing = async (req, res) => {
  try {
    const {
      crop,
      quantity,
      unit,
      market,
      askingPrice,
      description,
      expiresAt,
    } = req.body;

    if (
      !crop ||
      quantity === undefined ||
      !market ||
      askingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Crop, quantity, market and asking price are required',
      });
    }

    // Verify that the crop exists.
    const cropRecord = await Crop.findById(crop);

    if (!cropRecord) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    // Critical ownership check.
    if (
      cropRecord.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only list your own crops for sale',
      });
    }

    // Prevent creating a listing with an invalid quantity.
    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero',
      });
    }

    if (Number(askingPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Asking price cannot be negative',
      });
    }

    // Prevent duplicate active listings for the same crop.
    const existingListing = await SaleListing.findOne({
      crop,
      farmer: req.user._id,
      status: 'active',
    });

    if (existingListing) {
      return res.status(409).json({
        success: false,
        message: 'This crop already has an active sale listing',
        listing: existingListing,
      });
    }

    const listing = await SaleListing.create({
      crop,
      farmer: req.user._id,
      quantity: Number(quantity),
      unit: unit || 'quintal',
      market,
      askingPrice: Number(askingPrice),
      description,
      expiresAt: expiresAt || undefined,
      status: 'active',
    });

    const populatedListing = await SaleListing.findById(listing._id)
      .populate({
        path: 'crop',
        select: 'name variety area areaUnit sowingDate expectedHarvestDate status',
      })
      .populate({
        path: 'farmer',
        select: 'name phone email location',
      })
      .populate({
        path: 'market',
        select: 'name district state type location isOfficial source verificationStatus',
      });

    res.status(201).json({
      success: true,
      message: 'Crop listed for sale successfully',
      listing: populatedListing,
    });
  } catch (error) {
    console.error('Create sale listing error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create sale listing',
    });
  }
};

// PUT /api/sale-listings/:id
const updateSaleListing = async (req, res) => {
  try {
    const listing = await SaleListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Sale listing not found',
      });
    }

    // Admin can manage listings.
    // Farmers can only update their own listings.
    if (
      req.user.role !== 'admin' &&
      listing.farmer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this listing',
      });
    }

    // Only active listings can be edited by farmers.
    if (
      req.user.role === 'farmer' &&
      listing.status !== 'active'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Only active listings can be updated',
      });
    }

    const allowedFields = [
      'quantity',
      'unit',
      'market',
      'askingPrice',
      'description',
      'status',
      'expiresAt',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    if (listing.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero',
      });
    }

    if (listing.askingPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Asking price cannot be negative',
      });
    }

    await listing.save();

    const updatedListing = await SaleListing.findById(listing._id)
      .populate({
        path: 'crop',
        select: 'name variety area areaUnit sowingDate expectedHarvestDate status',
      })
      .populate({
        path: 'farmer',
        select: 'name phone email location',
      })
      .populate({
        path: 'market',
        select: 'name district state type location isOfficial source verificationStatus',
      });

    res.json({
      success: true,
      message: 'Sale listing updated successfully',
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Update sale listing error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update sale listing',
    });
  }
};

// DELETE /api/sale-listings/:id
const deleteSaleListing = async (req, res) => {
  try {
    const listing = await SaleListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Sale listing not found',
      });
    }

    // Admin or listing owner only.
    if (
      req.user.role !== 'admin' &&
      listing.farmer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this listing',
      });
    }

    await listing.deleteOne();

    res.json({
      success: true,
      message: 'Sale listing deleted successfully',
    });
  } catch (error) {
    console.error('Delete sale listing error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete sale listing',
    });
  }
};

module.exports = {
  getSaleListings,
  getSaleListingById,
  createSaleListing,
  updateSaleListing,
  deleteSaleListing,
};