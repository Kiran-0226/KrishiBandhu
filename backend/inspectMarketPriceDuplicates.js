require('dotenv').config();

const mongoose = require('mongoose');
const MarketPrice = require('./models/MarketPrice');

const runInspection = async () => {
  try {
    console.log('');
    console.log('🌾 KrishiBandhu - Duplicate Inspection');
    console.log('=======================================');
    console.log('');

    await mongoose.connect(process.env.MONGO_URI);

    console.log('🍃 MongoDB Connected');
    console.log('');

    const duplicateGroups = await MarketPrice.aggregate([
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
          records: {
            $push: {
              id: '$_id',
              unit: '$unit',
              arrivalQuantity: '$arrivalQuantity',
              minimumPrice: '$minimumPrice',
              maximumPrice: '$maximumPrice',
              modalPrice: '$modalPrice',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
            },
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
      {
        $sort: {
          '_id.priceDate': 1,
          '_id.commodity': 1,
        },
      },
    ]);

    console.log(
      `🔍 Duplicate groups found: ${duplicateGroups.length}`,
    );
    console.log('');

    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicate groups found.');
      await mongoose.disconnect();
      return;
    }

    duplicateGroups.forEach((group, index) => {
      console.log('');
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`GROUP ${index + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      console.log(
        `Market ID : ${group._id.market}`,
      );

      console.log(
        `Commodity : ${group._id.commodity}`,
      );

      console.log(
        `Variety   : ${group._id.variety || '(empty)'}`,
      );

      console.log(
        `Date      : ${group._id.priceDate}`,
      );

      console.log(
        `Records   : ${group.count}`,
      );

      group.records.forEach((record, recordIndex) => {
        console.log('');
        console.log(`  Record ${recordIndex + 1}`);
        console.log(`  ID       : ${record.id}`);
        console.log(`  Unit     : ${record.unit}`);
        console.log(
          `  Arrival  : ${record.arrivalQuantity}`,
        );
        console.log(
          `  Minimum  : ${record.minimumPrice}`,
        );
        console.log(
          `  Maximum  : ${record.maximumPrice}`,
        );
        console.log(
          `  Modal    : ${record.modalPrice}`,
        );

        if (record.createdAt) {
          console.log(
            `  Created  : ${record.createdAt}`,
          );
        }

        if (record.updatedAt) {
          console.log(
            `  Updated  : ${record.updatedAt}`,
          );
        }
      });
    });

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 INSPECTION ONLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('No database records were modified.');
    console.log('');

    await mongoose.disconnect();
  } catch (error) {
    console.error('');
    console.error('❌ Inspection failed');
    console.error('---------------------');
    console.error(error.message);
    console.error('');

    try {
      await mongoose.disconnect();
    } catch (_) {}

    process.exit(1);
  }
};

runInspection();