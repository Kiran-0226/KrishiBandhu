const Market = require('../models/Market');

/*
|--------------------------------------------------------------------------
| Get Admin Markets
|--------------------------------------------------------------------------
| Admin-only market management list.
|
| Supports:
| ?search=Lasalgaon
| ?district=Nashik
| ?status=pending
| ?status=verified
| ?status=rejected
| ?source=MSAMB
| ?source=user_submitted
|--------------------------------------------------------------------------
*/

const getAdminMarkets = async (req, res) => {
  try {
    const {
      search,
      district,
      status,
      source,
    } = req.query;

    const filter = {
      state: 'Maharashtra',
    };

    // Search by market name
    if (search && search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: 'i',
      };
    }

    // Filter by district
    if (district && district.trim()) {
      filter.district = {
        $regex: `^${district.trim()}$`,
        $options: 'i',
      };
    }

    // Filter by verification status
    if (
      status &&
      ['verified', 'pending', 'rejected'].includes(
        status,
      )
    ) {
      filter.verificationStatus = status;
    }

    // Filter by source
    if (
      source &&
      ['MSAMB', 'user_submitted'].includes(
        source,
      )
    ) {
      filter.source = source;
    }

    const markets = await Market.find(filter).sort({
      verificationStatus: 1,
      district: 1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: markets.length,
      markets,
    });
  } catch (error) {
    console.error(
      'Get Admin Markets Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch markets.',
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Admin Market Statistics
|--------------------------------------------------------------------------
*/

const getAdminMarketStats = async (
  req,
  res,
) => {
  try {
    const [
      total,
      official,
      pending,
      verified,
      rejected,
      userSubmitted,
    ] = await Promise.all([
      Market.countDocuments({
        state: 'Maharashtra',
      }),

      Market.countDocuments({
        state: 'Maharashtra',
        isOfficial: true,
      }),

      Market.countDocuments({
        state: 'Maharashtra',
        verificationStatus: 'pending',
      }),

      Market.countDocuments({
        state: 'Maharashtra',
        verificationStatus: 'verified',
      }),

      Market.countDocuments({
        state: 'Maharashtra',
        verificationStatus: 'rejected',
      }),

      Market.countDocuments({
        state: 'Maharashtra',
        source: 'user_submitted',
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        official,
        pending,
        verified,
        rejected,
        userSubmitted,
      },
    });
  } catch (error) {
    console.error(
      'Get Admin Market Stats Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch market statistics.',
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Admin Market
|--------------------------------------------------------------------------
*/

const getAdminMarketById = async (
  req,
  res,
) => {
  try {
    const market = await Market.findOne({
      _id: req.params.id,
      state: 'Maharashtra',
    });

    if (!market) {
      return res.status(404).json({
        success: false,
        message: 'Market not found.',
      });
    }

    return res.status(200).json({
      success: true,
      market,
    });
  } catch (error) {
    console.error(
      'Get Admin Market Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch market.',
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Market Verification
|--------------------------------------------------------------------------
| Only user-submitted markets can be approved/rejected.
|
| Body:
| {
|   "verificationStatus": "verified"
| }
|
| or
|
| {
|   "verificationStatus": "rejected"
| }
|--------------------------------------------------------------------------
*/

const updateMarketVerification = async (
  req,
  res,
) => {
  try {
    const {
      verificationStatus,
    } = req.body;

    if (
      ![
        'verified',
        'rejected',
      ].includes(verificationStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'verificationStatus must be verified or rejected.',
      });
    }

    const market = await Market.findById(
      req.params.id,
    );

    if (!market) {
      return res.status(404).json({
        success: false,
        message: 'Market not found.',
      });
    }

    // Official MSAMB markets are already
    // verified and must not be changed here.
    if (
      market.isOfficial ||
      market.source === 'MSAMB'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Official MSAMB markets cannot be modified through verification.',
      });
    }

    if (
      market.source !== 'user_submitted'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Only user-submitted markets can be verified or rejected.',
      });
    }

    market.verificationStatus =
      verificationStatus;

    // A verified user-submitted market becomes
    // available as a verified market, but it is
    // still distinguishable from MSAMB data.
    market.isOfficial = false;

    await market.save();

    return res.status(200).json({
      success: true,
      message:
        verificationStatus === 'verified'
          ? 'Market verified successfully.'
          : 'Market rejected successfully.',
      market,
    });
  } catch (error) {
    console.error(
      'Update Market Verification Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to update market verification.',
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete User-Submitted Market
|--------------------------------------------------------------------------
| Official MSAMB markets cannot be deleted.
|--------------------------------------------------------------------------
*/

const deleteAdminMarket = async (
  req,
  res,
) => {
  try {
    const market = await Market.findById(
      req.params.id,
    );

    if (!market) {
      return res.status(404).json({
        success: false,
        message: 'Market not found.',
      });
    }

    // Protect official markets.
    if (
      market.isOfficial ||
      market.source === 'MSAMB'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Official MSAMB markets cannot be deleted.',
      });
    }

    await Market.findByIdAndDelete(
      req.params.id,
    );

    return res.status(200).json({
      success: true,
      message:
        'User-submitted market deleted successfully.',
    });
  } catch (error) {
    console.error(
      'Delete Admin Market Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to delete market.',
    });
  }
};

module.exports = {
  getAdminMarkets,
  getAdminMarketStats,
  getAdminMarketById,
  updateMarketVerification,
  deleteAdminMarket,
};