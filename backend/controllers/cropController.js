const Crop = require('../models/Crop');

// GET all crops
const getCrops = async (req, res) => {
  try {
    const crops = await Crop.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error) {
    console.error('Get crops error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops',
    });
  }
};

// GET single crop
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    console.error('Get crop error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop',
    });
  }
};

// CREATE crop
const createCrop = async (req, res) => {
  try {
    const crop = await Crop.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Crop created successfully',
      data: crop,
    });
  } catch (error) {
    console.error('Create crop error:', error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE crop
const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      data: crop,
    });
  } catch (error) {
    console.error('Update crop error:', error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE crop
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crop deleted successfully',
    });
  } catch (error) {
    console.error('Delete crop error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete crop',
    });
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
};