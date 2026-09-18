require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('./config/db');
const Market = require('./models/Market');
const MarketPrice = require('./models/MarketPrice');
const marketPrices = require('./services/marketPriceSeed');

const seedMarketPrices = async () => {
  try {
    await connectDB();

    console.log('');
    console.log('📈 Seeding Maharashtra Market Prices');
    console.log('--------------------------------------');

    let addedCount = 0;
    let skippedCount = 0;

    for (const priceData of marketPrices) {
      const market = await Market.findOne({
        name: priceData.marketName,
        state: 'Maharashtra',
      });

      if (!market) {
        console.log(
          `⚠️  Market not found: ${priceData.marketName}`
        );

        continue;
      }

      const existingPrice =
        await MarketPrice.findOne({
          market: market._id,
          commodity: priceData.commodity,
          variety: priceData.variety || '',
          priceDate: priceData.priceDate,
        });

      if (existingPrice) {
        skippedCount++;

        console.log(
          `⏭️  Already exists: ${priceData.commodity} - ${priceData.marketName}`
        );

        continue;
      }

      await MarketPrice.create({
        market: market._id,

        commodity:
          priceData.commodity,

        variety:
          priceData.variety || '',

        unit:
          priceData.unit || 'quintal',

        arrivalQuantity:
          priceData.arrivalQuantity,

        minimumPrice:
          priceData.minimumPrice,

        maximumPrice:
          priceData.maximumPrice,

        modalPrice:
          priceData.modalPrice,

        priceDate:
          priceData.priceDate,

        source: 'MSAMB',
      });

      addedCount++;

      console.log(
        `✅ Added: ${priceData.commodity} - ${priceData.marketName}`
      );
    }

    console.log('');
    console.log('--------------------------------------');
    console.log(`✅ Added: ${addedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(
      `📊 Seed records: ${marketPrices.length}`
    );
    console.log('');

    await mongoose.connection.close();

    console.log('🍃 MongoDB connection closed.');
    console.log(
      '🎉 Market price seeding completed successfully!'
    );
  } catch (error) {
    console.error('');
    console.error(
      '❌ Market price seeding failed:'
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

seedMarketPrices();