const Market = require('../models/Market');

// =========================================
// Get all markets
// =========================================

const getMarkets = async (req, res) => {
  try {
    const {
      district,
      search,
    } = req.query;

    const filter = {
      state: 'Maharashtra',
    };

    // Filter by district
    if (district && district.trim()) {
      filter.district = district.trim();
    }

    // Search by market name
    if (search && search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: 'i',
      };
    }

    const markets = await Market.find(filter).sort({
      district: 1,
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: markets.length,
      data: markets,
    });
  } catch (error) {
    console.error(
      'Get markets error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to fetch markets.',
    });
  }
};

// =========================================
// Get single market
// =========================================

const getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(
      req.params.id
    );

    if (!market) {
      return res.status(404).json({
        success: false,
        message: 'Market not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: market,
    });
  } catch (error) {
    console.error(
      'Get market error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to fetch market.',
    });
  }
};

// =========================================
// Add missing market
// =========================================

const createMarket = async (req, res) => {
  try {
    const {
      name,
      district,
      type,
      location,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !name.trim() ||
      !district ||
      !district.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Market name and district are required.',
      });
    }

    // Check for duplicate market
    const existingMarket =
      await Market.findOne({
        name: {
          $regex: `^${name.trim()}$`,
          $options: 'i',
        },
        district: {
          $regex: `^${district.trim()}$`,
          $options: 'i',
        },
        state: 'Maharashtra',
      });

    if (existingMarket) {
      return res.status(409).json({
        success: false,
        message:
          'This market already exists.',
      });
    }

    // User-submitted markets are NOT
    // automatically treated as official.
    const market = await Market.create({
      name: name.trim(),
      district: district.trim(),
      state: 'Maharashtra',
      type: type || 'Other',
      location: location
        ? location.trim()
        : '',
      isOfficial: false,
      source: 'user_submitted',
      verificationStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message:
        'Market submitted successfully. It is pending verification.',
      data: market,
    });
  } catch (error) {
    console.error(
      'Create market error:',
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to submit market.',
    });
  }
};

// =========================================
// Delete market
// =========================================

const deleteMarket = async (req, res) => {
  try {
    const market =
      await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({
        success: false,
        message: 'Market not found.',
      });
    }

    // Do not allow official markets to be
    // deleted through this endpoint.
    if (market.isOfficial) {
      return res.status(403).json({
        success: false,
        message:
          'Official markets cannot be deleted.',
      });
    }

    await Market.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        'Submitted market deleted successfully.',
    });
  } catch (error) {
    console.error(
      'Delete market error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to delete market.',
    });
  }
};

module.exports = {
  getMarkets,
  getMarketById,
  createMarket,
  deleteMarket,
};