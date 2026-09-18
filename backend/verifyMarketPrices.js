require('dotenv').config();

const mongoose = require('mongoose');
const MarketPrice = require('./models/MarketPrice');

const runVerification = async () => {
  try {
    console.log('');
    console.log('🌾 KrishiBandhu MarketPrice Verification');
    console.log('=========================================');
    console.log('');

    await mongoose.connect(process.env.MONGO_URI);

    console.log('🍃 MongoDB Connected');
    console.log('');

    const total = await MarketPrice.countDocuments({
      source: 'MSAMB',
    });

    const commodities = await MarketPrice.distinct(
      'commodity',
      {
        source: 'MSAMB',
      },
    );

    // Check for Devanagari characters without
    // putting the Unicode regex directly in PowerShell.
    const devanagariPattern = /[\u0900-\u097F]/;

    const marathiCommodities = commodities.filter(
      (commodity) =>
        typeof commodity === 'string' &&
        devanagariPattern.test(commodity),
    );

    const recordsWithMarathiCommodity =
      marathiCommodities.length > 0
        ? await MarketPrice.countDocuments({
            source: 'MSAMB',
            commodity: {
              $in: marathiCommodities,
            },
          })
        : 0;

    console.log(
      `📊 Total MSAMB records: ${total}`,
    );

    console.log(
      `🔤 Marathi commodity records: ${recordsWithMarathiCommodity}`,
    );

    console.log(
      `🌱 Unique commodities: ${commodities.length}`,
    );

    console.log('');

    if (marathiCommodities.length === 0) {
      console.log(
        '✅ No Marathi/Devanagari commodity names found.',
      );
    } else {
      console.log(
        '⚠️ Marathi/Devanagari commodities found:',
      );

      marathiCommodities.forEach(
        (commodity) => {
          console.log(`   - ${commodity}`);
        },
      );
    }

    console.log('');
    console.log('📋 Commodities');
    console.log('--------------');

    commodities
      .sort((a, b) =>
        String(a).localeCompare(
          String(b),
        ),
      )
      .forEach((commodity) => {
        console.log(`- ${commodity}`);
      });

    console.log('');
    console.log('🔍 Duplicate logical records');
    console.log('----------------------------');

    const duplicateGroups =
      await MarketPrice.aggregate([
        {
          $match: {
            source: 'MSAMB',
          },
        },
        {
          $group: {
            _id: {
              market: '$market',
              commodity: '$commodity',
              variety: '$variety',
              priceDate: '$priceDate',
              source: '$source',
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $match: {
            count: {
              $gt: 1,
            },
          },
        },
      ]);

    if (duplicateGroups.length === 0) {
      console.log(
        '✅ No duplicate logical records found.',
      );
    } else {
      console.log(
        `⚠️ Duplicate groups found: ${duplicateGroups.length}`,
      );

      duplicateGroups.forEach((group) => {
        console.log('');
        console.log(
          `Market: ${group._id.market}`,
        );
        console.log(
          `Commodity: ${group._id.commodity}`,
        );
        console.log(
          `Variety: ${group._id.variety}`,
        );
        console.log(
          `Date: ${group._id.priceDate}`,
        );
        console.log(
          `Count: ${group.count}`,
        );
      });
    }

    console.log('');
    console.log('=========================================');
    console.log('🌾 Verification complete');
    console.log('=========================================');
    console.log('');

    await mongoose.disconnect();
  } catch (error) {
    console.error('');
    console.error('❌ Verification failed');
    console.error('----------------------');
    console.error(error.message);
    console.error('');

    try {
      await mongoose.disconnect();
    } catch (_) {}

    process.exit(1);
  }
};

runVerification();