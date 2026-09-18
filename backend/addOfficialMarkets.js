require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('./config/db');
const Market = require('./models/Market');

const markets = [
  {
    name: 'Akluj APMC',
    district: 'Solapur',
  },
  {
    name: 'Akot APMC',
    district: 'Akola',
  },
  {
    name: 'Akola APMC',
    district: 'Akola',
  },
  {
    name: 'Ahilyanagar APMC',
    district: 'Ahilyanagar',
  },
  {
    name: 'Armori APMC',
    district: 'Gadchiroli',
  },
  {
    name: 'Karmala APMC',
    district: 'Solapur',
  },
  {
    name: 'Karad APMC',
    district: 'Satara',
  },
  {
    name: 'Gondia APMC',
    district: 'Gondia',
  },
  {
    name: 'Jalgaon APMC',
    district: 'Jalgaon',
  },
  {
    name: 'Dharashiv APMC',
    district: 'Dharashiv',
  },
  {
    name: 'Dhule APMC',
    district: 'Dhule',
  },
  {
    name: 'Mumbai APMC',
    district: 'Mumbai',
  },
  {
    name: 'Ratnagiri APMC',
    district: 'Ratnagiri',
  },
  {
    name: 'Washim APMC',
    district: 'Washim',
  },
  {
    name: 'Satara APMC',
    district: 'Satara',
  },
];

const addOfficialMarkets = async () => {
  try {
    await connectDB();

    console.log('');
    console.log('🌾 Adding Official MSAMB Markets');
    console.log('--------------------------------');

    let addedCount = 0;
    let skippedCount = 0;

    for (const marketData of markets) {
      const existingMarket =
        await Market.findOne({
          name: marketData.name,
          state: 'Maharashtra',
        });

      if (existingMarket) {
        console.log(
          `⏭️  Already exists: ${marketData.name}`
        );

        skippedCount++;
        continue;
      }

      await Market.create({
        name: marketData.name,
        district: marketData.district,
        state: 'Maharashtra',
        type: 'APMC',
        location: `${marketData.district}, Maharashtra`,
        isOfficial: true,
        source: 'MSAMB',
        verificationStatus: 'verified',
      });

      console.log(
        `✅ Added: ${marketData.name} - ${marketData.district}`
      );

      addedCount++;
    }

    console.log('');
    console.log('--------------------------------');
    console.log('🌾 Official Market Import Complete');
    console.log('--------------------------------');

    console.log(
      `✅ Added: ${addedCount}`
    );

    console.log(
      `⏭️  Skipped: ${skippedCount}`
    );

    console.log(
      `📊 Processed: ${markets.length}`
    );

    console.log('');

    await mongoose.connection.close();

    console.log(
      '🍃 MongoDB connection closed.'
    );

    console.log(
      '🎉 Market import completed successfully!'
    );
  } catch (error) {
    console.error('');
    console.error(
      '❌ Market import failed:'
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

addOfficialMarkets();