const MarketPrice = require('../models/MarketPrice');
const Market = require('../models/Market');

// =========================================
// Get Market Prices
// =========================================

const getMarketPrices = async (req, res) => {
  try {
    const {
      market,
      commodity,
      district,
      date,
    } = req.query;

    const filter = {};

    // Filter by market ID
    if (market && market.trim()) {
      filter.market = market.trim();
    }

    // Filter by commodity
    if (commodity && commodity.trim()) {
      filter.commodity = {
        $regex: commodity.trim(),
        $options: 'i',
      };
    }

    // Filter by date
    if (date && date.trim()) {
      const startDate = new Date(
        `${date.trim()}T00:00:00`
      );

      const endDate = new Date(
        `${date.trim()}T23:59:59.999`
      );

      if (
        !Number.isNaN(startDate.getTime()) &&
        !Number.isNaN(endDate.getTime())
      ) {
        filter.priceDate = {
          $gte: startDate,
          $lte: endDate,
        };
      }
    }

    // If district is supplied,
    // first find Maharashtra markets
    // belonging to that district.
    if (district && district.trim()) {
      const districtMarkets =
        await Market.find({
          district: {
            $regex: `^${district.trim()}$`,
            $options: 'i',
          },
          state: 'Maharashtra',
        }).select('_id');

      filter.market = {
        $in: districtMarkets.map(
          (item) => item._id
        ),
      };
    }

    const prices = await MarketPrice.find(
      filter
    )
      .populate(
        'market',
        'name district state type location isOfficial'
      )
      .sort({
        priceDate: -1,
        commodity: 1,
      });

    res.status(200).json({
      success: true,
      count: prices.length,
      data: prices,
    });
  } catch (error) {
    console.error(
      'Get market prices error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch market prices.',
    });
  }
};

// =========================================
// Get Single Market Price
// =========================================

const getMarketPriceById = async (
  req,
  res
) => {
  try {
    const price =
      await MarketPrice.findById(
        req.params.id
      ).populate(
        'market',
        'name district state type location isOfficial'
      );

    if (!price) {
      return res.status(404).json({
        success: false,
        message:
          'Market price not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: price,
    });
  } catch (error) {
    console.error(
      'Get market price error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch market price.',
    });
  }
};

// =========================================
// Create Market Price
// =========================================

const createMarketPrice = async (
  req,
  res
) => {
  try {
    const {
      market,
      commodity,
      variety,
      unit,
      arrivalQuantity,
      minimumPrice,
      maximumPrice,
      modalPrice,
      priceDate,
      source,
    } = req.body;

    // =======================================
    // Required field validation
    // =======================================

    if (!market) {
      return res.status(400).json({
        success: false,
        message:
          'Market is required.',
      });
    }

    if (
      !commodity ||
      !commodity.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Commodity is required.',
      });
    }

    if (!priceDate) {
      return res.status(400).json({
        success: false,
        message:
          'Price date is required.',
      });
    }

    if (
      minimumPrice === undefined ||
      maximumPrice === undefined ||
      modalPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Minimum, maximum and modal prices are required.',
      });
    }

    // =======================================
    // Validate market
    // =======================================

    const selectedMarket =
      await Market.findById(market);

    if (!selectedMarket) {
      return res.status(404).json({
        success: false,
        message:
          'Selected market was not found.',
      });
    }

    // Only Maharashtra markets
    // are allowed.
    if (
      selectedMarket.state !==
      'Maharashtra'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Only Maharashtra markets are supported.',
      });
    }

    // =======================================
    // Validate numeric prices
    // =======================================

    const minPrice = Number(
      minimumPrice
    );

    const maxPrice = Number(
      maximumPrice
    );

    const modal = Number(
      modalPrice
    );

    if (
      !Number.isFinite(minPrice) ||
      !Number.isFinite(maxPrice) ||
      !Number.isFinite(modal)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Prices must be valid numbers.',
      });
    }

    if (
      minPrice < 0 ||
      maxPrice < 0 ||
      modal < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Prices cannot be negative.',
      });
    }

    if (minPrice > maxPrice) {
      return res.status(400).json({
        success: false,
        message:
          'Minimum price cannot be greater than maximum price.',
      });
    }

    if (
      modal < minPrice ||
      modal > maxPrice
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Modal price must be between minimum and maximum price.',
      });
    }

    // =======================================
    // Validate arrival quantity
    // =======================================

    let quantity;

    if (
      arrivalQuantity !== undefined &&
      arrivalQuantity !== ''
    ) {
      quantity = Number(
        arrivalQuantity
      );

      if (
        !Number.isFinite(quantity) ||
        quantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Arrival quantity must be a valid positive number.',
        });
      }
    }

    // =======================================
    // Validate price date
    // =======================================

    const parsedDate = new Date(
      priceDate
    );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid price date.',
      });
    }

    // =======================================
    // Create price record
    // =======================================

    const price =
      await MarketPrice.create({
        market: selectedMarket._id,

        commodity:
          commodity.trim(),

        variety: variety
          ? variety.trim()
          : '',

        unit: unit
          ? unit.trim()
          : 'quintal',

        arrivalQuantity:
          quantity,

        minimumPrice: minPrice,

        maximumPrice: maxPrice,

        modalPrice: modal,

        priceDate: parsedDate,

        source: source || 'manual',
      });

    // Populate market information
    await price.populate(
      'market',
      'name district state type location isOfficial'
    );

    res.status(201).json({
      success: true,
      message:
        'Market price created successfully.',
      data: price,
    });
  } catch (error) {
    console.error(
      'Create market price error:',
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        'Failed to create market price.',
    });
  }
};

// =========================================
// Delete Market Price
// =========================================

const deleteMarketPrice = async (
  req,
  res
) => {
  try {
    const price =
      await MarketPrice.findByIdAndDelete(
        req.params.id
      );

    if (!price) {
      return res.status(404).json({
        success: false,
        message:
          'Market price not found.',
      });
    }

    res.status(200).json({
      success: true,
      message:
        'Market price deleted successfully.',
    });
  } catch (error) {
    console.error(
      'Delete market price error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to delete market price.',
    });
  }
};

module.exports = {
  getMarketPrices,
  getMarketPriceById,
  createMarketPrice,
  deleteMarketPrice,
};