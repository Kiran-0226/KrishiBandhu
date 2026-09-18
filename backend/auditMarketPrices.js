require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('./config/db');
const MarketPrice = require('./models/MarketPrice');

const auditMarketPrices = async () => {
  try {
    await connectDB();

    console.log('');
    console.log('📊 MarketPrice Database Audit');
    console.log('================================');

    // ---------------------------------------
    // Total records
    // ---------------------------------------

    const total =
      await MarketPrice.countDocuments();

    console.log(
      `💰 Total price records: ${total}`
    );

    // ---------------------------------------
    // Records grouped by source
    // ---------------------------------------

    const bySource =
      await MarketPrice.aggregate([
        {
          $group: {
            _id: '$source',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);

    console.log('');
    console.log('📡 Records by source:');

    console.table(bySource);

    // ---------------------------------------
    // Records grouped by date
    // ---------------------------------------

    const byDate =
      await MarketPrice.aggregate([
        {
          $group: {
            _id: '$priceDate',
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $limit: 10,
        },
      ]);

    console.log('');
    console.log('📅 Latest price dates:');

    console.table(
      byDate.map((item) => ({
        date: item._id
          ? new Date(
              item._id
            ).toISOString().split('T')[0]
          : 'Unknown',

        count: item.count,
      }))
    );

    // ---------------------------------------
    // Non-MSAMB records
    // ---------------------------------------

    const nonMSAMB =
      await MarketPrice.find({
        source: {
          $ne: 'MSAMB',
        },
      })
        .populate(
          'market',
          'name district'
        )
        .lean();

    console.log('');
    console.log(
      `🧪 Non-MSAMB records: ${nonMSAMB.length}`
    );

    if (nonMSAMB.length > 0) {
      console.table(
        nonMSAMB.map((price) => ({
          id: price._id.toString(),

          market:
            price.market?.name ||
            'Unknown',

          district:
            price.market?.district ||
            'Unknown',

          commodity:
            price.commodity,

          variety:
            price.variety || '',

          minimum:
            price.minimumPrice,

          modal:
            price.modalPrice,

          maximum:
            price.maximumPrice,

          source:
            price.source || 'Unknown',

          date:
            price.priceDate
              ? new Date(
                  price.priceDate
                )
                  .toISOString()
                  .split('T')[0]
              : 'Unknown',
        }))
      );
    }

    // ---------------------------------------
    // MSAMB count
    // ---------------------------------------

    const msambCount =
      await MarketPrice.countDocuments({
        source: 'MSAMB',
      });

    console.log('');
    console.log(
      `🌾 Official MSAMB records: ${msambCount}`
    );

    console.log(
      `🧪 Other/development records: ${nonMSAMB.length}`
    );

    console.log('');
    console.log('================================');
    console.log('✅ Audit completed successfully.');
    console.log(
      'ℹ️ No records were modified or deleted.'
    );
    console.log('================================');
    console.log('');

    await mongoose.connection.close();

    console.log(
      '🍃 MongoDB connection closed.'
    );
  } catch (error) {
    console.error('');
    console.error(
      '❌ Market price audit failed:'
    );

    console.error(error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error(
        'Failed to close MongoDB connection:',
        closeError.message
      );
    }

    process.exit(1);
  }
};

auditMarketPrices();