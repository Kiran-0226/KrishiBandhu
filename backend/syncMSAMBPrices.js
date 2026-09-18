require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('./config/db');
const {
  syncMSAMBPrices,
} = require('./services/marketPriceService');

const runSync = async () => {
  try {
    await connectDB();

    console.log('');
    console.log('🌾 KrishiBandhu');
    console.log('📡 Official MSAMB Price Sync');
    console.log('================================');

    const result =
      await syncMSAMBPrices();

    console.log('');
    console.log('================================');
    console.log('🎉 MSAMB PRICE SYNC COMPLETED');
    console.log('================================');

    console.log(
      `📥 Fetched: ${result.fetched}`
    );

    console.log(
      `🆕 Inserted: ${result.inserted}`
    );

    console.log(
      `🔄 Updated: ${result.updated}`
    );

    console.log(
      `⏭️  Skipped markets: ${result.skippedMarkets}`
    );

    console.log(
      `⚠️ Failed records: ${result.failed}`
    );

    console.log('');

    await mongoose.connection.close();

    console.log(
      '🍃 MongoDB connection closed.'
    );
  } catch (error) {
    console.error('');
    console.error(
      '❌ MSAMB price sync failed:'
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

runSync();