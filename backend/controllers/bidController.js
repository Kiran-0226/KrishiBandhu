const Bid = require('../models/Bid');
const Crop = require('../models/Crop');
const Market = require('../models/Market');

const getBids = async (req, res) => {
  try {
    const bids = await Bid.find()
      .populate('crop')
      .populate('market')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    console.error('Get bids error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch bids.',
    });
  }
};

const getBidById = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('crop')
      .populate('market');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (error) {
    console.error('Get bid error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch bid.',
    });
  }
};

const createBid = async (req, res) => {
  try {
    const {
      crop,
      market,
      buyerName,
      buyerContact,
      quantity,
      pricePerUnit,
      message,
    } = req.body;

    if (
      !crop ||
      !market ||
      !buyerName ||
      !buyerContact ||
      quantity === undefined ||
      pricePerUnit === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Crop, market, buyer details, quantity and price are required.',
      });
    }

    const parsedQuantity = Number(quantity);
    const parsedPrice = Number(pricePerUnit);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0.',
      });
    }

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Price per unit cannot be negative.',
      });
    }

    const cropExists = await Crop.findById(crop);

    if (!cropExists) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found.',
      });
    }

    const marketExists = await Market.findById(market);

    if (!marketExists) {
      return res.status(404).json({
        success: false,
        message: 'Market not found.',
      });
    }

    const totalAmount = Number(
      (parsedQuantity * parsedPrice).toFixed(2),
    );

    const bid = await Bid.create({
      crop,
      market,
      buyerName: buyerName.trim(),
      buyerContact: buyerContact.trim(),
      quantity: parsedQuantity,
      pricePerUnit: parsedPrice,
      totalAmount,
      message: message ? message.trim() : '',
      status: 'pending',
    });

    const populatedBid = await Bid.findById(bid._id)
      .populate('crop')
      .populate('market');

    res.status(201).json({
      success: true,
      message: 'Bid created successfully.',
      data: populatedBid,
    });
  } catch (error) {
    console.error('Create bid error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create bid.',
    });
  }
};

const updateBidStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          'Status must be pending, accepted, or rejected.',
      });
    }

    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found.',
      });
    }

    bid.status = status;

    await bid.save();

    const updatedBid = await Bid.findById(bid._id)
      .populate('crop')
      .populate('market');

    res.status(200).json({
      success: true,
      message: `Bid ${status} successfully.`,
      data: updatedBid,
    });
  } catch (error) {
    console.error('Update bid status error:', error);

    res.status(400).json({
      success: false,
      message:
        error.message || 'Failed to update bid status.',
    });
  }
};

const deleteBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found.',
      });
    }

    await Bid.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Bid deleted successfully.',
    });
  } catch (error) {
    console.error('Delete bid error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete bid.',
    });
  }
};

module.exports = {
  getBids,
  getBidById,
  createBid,
  updateBidStatus,
  deleteBid,
};