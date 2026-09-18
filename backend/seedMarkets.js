require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('./config/db');
const Market = require('./models/Market');
const markets = require('./services/marketSeed');

const seedMarkets = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log('');
    console.log('🌾 Seeding Maharashtra Markets');
    console.log('--------------------------------');

    let addedCount = 0;
    let skippedCount = 0;

    for (const marketData of markets) {
      const existingMarket =
        await Market.findOne({
          name: marketData.name,
          district: marketData.district,
          state: 'Maharashtra',
        });

      if (existingMarket) {
        skippedCount++;

        console.log(
          `⏭️  Already exists: ${marketData.name}`
        );

        continue;
      }

      await Market.create(marketData);

      addedCount++;

      console.log(
        `✅ Added: ${marketData.name}`
      );
    }

    console.log('');
    console.log('--------------------------------');
    console.log(
      `✅ Added: ${addedCount}`
    );
    console.log(
      `⏭️  Skipped: ${skippedCount}`
    );
    console.log(
      `📊 Total seed records: ${markets.length}`
    );
    console.log('');

    await mongoose.connection.close();

    console.log(
      '🍃 MongoDB connection closed.'
    );
    console.log(
      '🎉 Market seeding completed successfully!'
    );
  } catch (error) {
    console.error('');
    console.error(
      '❌ Market seeding failed:'
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

seedMarkets();