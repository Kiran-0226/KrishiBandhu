const Crop = require('../models/Crop');

// ==========================================
// GET all crops
// Farmer:
//   Returns only crops owned by the logged-in farmer.
// Admin:
//   Returns all crops.
// ==========================================

const getCrops = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : {
            owner: req.user._id,
          };

    const crops = await Crop.find(filter)
      .populate(
        'owner',
        'name email phone role',
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error) {
    console.error(
      'Get crops error:',
      error,
    );

    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops.',
    });
  }
};


// ==========================================
// GET single crop
// ==========================================

const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(
      req.params.id,
    ).populate(
      'owner',
      'name email phone role',
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found.',
      });
    }

    // Admin can access any crop.
    // Other users can access only their own crop.
    if (
      req.user.role !== 'admin' &&
      crop.owner._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access this crop.',
      });
    }

    res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    console.error(
      'Get crop error:',
      error,
    );

    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop.',
    });
  }
};


// ==========================================
// CREATE crop
// ==========================================

const createCrop = async (req, res) => {
  try {
    const crop = await Crop.create({
      ...req.body,

      // IMPORTANT:
      // Owner always comes from the authenticated user.
      owner: req.user._id,
    });

    const populatedCrop =
      await Crop.findById(crop._id).populate(
        'owner',
        'name email phone role',
      );

    res.status(201).json({
      success: true,
      message:
        'Crop created successfully.',
      data: populatedCrop,
    });
  } catch (error) {
    console.error(
      'Create crop error:',
      error,
    );

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// UPDATE crop
// ==========================================

const updateCrop = async (req, res) => {
  try {
    const existingCrop =
      await Crop.findById(
        req.params.id,
      );

    if (!existingCrop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found.',
      });
    }

    // Admin can update any crop.
    // Farmer can update only their own crop.
    if (
      req.user.role !== 'admin' &&
      existingCrop.owner.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to update this crop.',
      });
    }

    // Never allow the client to change ownership.
    const {
      owner,
      ...updateData
    } = req.body;

    const crop =
      await Crop.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      ).populate(
        'owner',
        'name email phone role',
      );

    res.status(200).json({
      success: true,
      message:
        'Crop updated successfully.',
      data: crop,
    });
  } catch (error) {
    console.error(
      'Update crop error:',
      error,
    );

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// DELETE crop
// ==========================================

const deleteCrop = async (req, res) => {
  try {
    const existingCrop =
      await Crop.findById(
        req.params.id,
      );

    if (!existingCrop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found.',
      });
    }

    // Admin can delete any crop.
    // Farmer can delete only their own crop.
    if (
      req.user.role !== 'admin' &&
      existingCrop.owner.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to delete this crop.',
      });
    }

    await Crop.findByIdAndDelete(
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message:
        'Crop deleted successfully.',
    });
  } catch (error) {
    console.error(
      'Delete crop error:',
      error,
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to delete crop.',
    });
  }
};


// ==========================================
// Exports
// ==========================================

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
};