const Crop = require('../models/Crop');
const User = require('../models/User');

// ==========================================
// GET ADMIN CROPS
// ==========================================
//
// Admin only.
// Supports:
// - search
// - status
// - farmer
// - crop name
// - pagination
//
// ==========================================

const getAdminCrops = async (req, res) => {
  try {
    const {
      search,
      status,
      farmer,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    // ==========================================
    // Status filter
    // ==========================================

    if (
      status &&
      [
        'planned',
        'growing',
        'ready',
        'harvested',
      ].includes(status)
    ) {
      filter.status = status;
    }

    // ==========================================
    // Farmer filter
    // ==========================================

    if (
      farmer &&
      farmer.trim()
    ) {
      filter.owner = farmer.trim();
    }

    // ==========================================
    // Search
    // ==========================================
    //
    // Crop name / variety are searched directly.
    // Farmer search is handled separately below.
    //
    // ==========================================

    if (
      search &&
      search.trim()
    ) {
      const searchRegex = {
        $regex: search.trim(),
        $options: 'i',
      };

      const matchingUsers =
        await User.find({
          role: 'farmer',
          $or: [
            {
              name: searchRegex,
            },
            {
              email: searchRegex,
            },
            {
              phone: searchRegex,
            },
          ],
        }).select('_id');

      const matchingUserIds =
        matchingUsers.map(
          (user) => user._id,
        );

      filter.$or = [
        {
          name: searchRegex,
        },
        {
          variety: searchRegex,
        },
        {
          owner: {
            $in: matchingUserIds,
          },
        },
      ];
    }

    // ==========================================
    // Pagination
    // ==========================================

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1,
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 50,
          1,
        ),
        100,
      );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    // ==========================================
    // Query
    // ==========================================

    const [
      crops,
      total,
    ] = await Promise.all([
      Crop.find(filter)
        .populate(
          'owner',
          'name email phone role location isActive isVerified',
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      Crop.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: crops.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages:
        Math.ceil(
          total /
            limitNumber,
        ),
      data: crops,
    });
  } catch (error) {
    console.error(
      'Get admin crops error:',
      error,
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch admin crops.',
    });
  }
};


// ==========================================
// GET ADMIN CROP STATS
// ==========================================
//
// Returns:
// - total crops
// - planned
// - growing
// - ready
// - harvested
// - total cultivated area
//
// ==========================================

const getAdminCropStats = async (
  req,
  res,
) => {
  try {
    const [
      total,
      planned,
      growing,
      ready,
      harvested,
      areaResult,
    ] = await Promise.all([
      Crop.countDocuments(),

      Crop.countDocuments({
        status: 'planned',
      }),

      Crop.countDocuments({
        status: 'growing',
      }),

      Crop.countDocuments({
        status: 'ready',
      }),

      Crop.countDocuments({
        status: 'harvested',
      }),

      Crop.aggregate([
        {
          $group: {
            _id: '$areaUnit',
            totalArea: {
              $sum: '$area',
            },
          },
        },
      ]),
    ]);

    const area = {
      acre: 0,
      hectare: 0,
      gunta: 0,
    };

    areaResult.forEach(
      (item) => {
        if (
          Object.prototype.hasOwnProperty.call(
            area,
            item._id,
          )
        ) {
          area[item._id] =
            Number(
              item.totalArea.toFixed(
                2,
              ),
            );
        }
      },
    );

    res.status(200).json({
      success: true,
      stats: {
        total,
        planned,
        growing,
        ready,
        harvested,
        area,
      },
    });
  } catch (error) {
    console.error(
      'Get admin crop stats error:',
      error,
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch crop statistics.',
    });
  }
};


// ==========================================
// GET ADMIN CROP BY ID
// ==========================================
//
// Admin can inspect any crop.
//
// ==========================================

const getAdminCropById = async (
  req,
  res,
) => {
  try {
    const crop =
      await Crop.findById(
        req.params.id,
      ).populate(
        'owner',
        'name email phone role location isActive isVerified createdAt',
      );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message:
          'Crop not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error) {
    console.error(
      'Get admin crop error:',
      error,
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch crop.',
    });
  }
};


// ==========================================
// DELETE ADMIN CROP
// ==========================================
//
// Admin can delete any crop.
//
// ==========================================

const deleteAdminCrop = async (
  req,
  res,
) => {
  try {
    const crop =
      await Crop.findById(
        req.params.id,
      );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message:
          'Crop not found.',
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
      'Delete admin crop error:',
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
// EXPORTS
// ==========================================

module.exports = {
  getAdminCrops,
  getAdminCropStats,
  getAdminCropById,
  deleteAdminCrop,
};