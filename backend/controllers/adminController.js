const User = require('../models/User');
const Crop = require('../models/Crop');
const Market = require('../models/Market');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');

const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalTraders,
      totalAdmins,
      totalMarkets,
      totalCrops,
      totalBids,
      totalTransactions,
      transactionSummary,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: 'farmer',
      }),

      User.countDocuments({
        role: 'trader',
      }),

      User.countDocuments({
        role: 'admin',
      }),

      Market.countDocuments(),

      Crop.countDocuments(),

      Bid.countDocuments(),

      Transaction.countDocuments(),

      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: '$amount',
            },
          },
        },
      ]),
    ]);

    const totalTransactionAmount =
      transactionSummary.length > 0
        ? transactionSummary[0].totalAmount
        : 0;

    return res.status(200).json({
      success: true,

      stats: {
        users: totalUsers,
        farmers: totalFarmers,
        traders: totalTraders,
        admins: totalAdmins,
        markets: totalMarkets,
        crops: totalCrops,
        bids: totalBids,
        transactions: totalTransactions,
        transactionAmount: totalTransactionAmount,
      },
    });
  } catch (error) {
    console.error(
      'Admin Dashboard Stats Error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch admin dashboard statistics.',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  getAdminDashboardStats,
};