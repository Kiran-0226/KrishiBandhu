require('dotenv').config();

const fs = require('fs');
const path = require('path');

const connectDB = require('./config/db');
const MarketPrice = require('./models/MarketPrice');
const { normalizeCommodity } = require('./services/marketPriceService');

const APPLY_MODE = process.argv.includes('--apply');

const runMigration = async () => {
  try {
    console.log('');
    console.log('🌾 KrishiBandhu - Commodity Migration');
    console.log('======================================');
    console.log('');

    await connectDB();

    console.log('📦 Reading MSAMB market price records...');

    const records = await MarketPrice.find({
      source: 'MSAMB',
    }).sort({
      priceDate: 1,
      _id: 1,
    });

    console.log(`📊 Total MSAMB records found: ${records.length}`);
    console.log('');

    if (records.length === 0) {
      console.log('ℹ️ No MSAMB records found.');
      process.exit(0);
    }

    const changes = [];
    const unchanged = [];
    const conflicts = [];

    for (const record of records) {
      const oldCommodity = record.commodity;

      const normalizedCommodity =
        normalizeCommodity(oldCommodity);

      if (
        !normalizedCommodity ||
        normalizedCommodity === oldCommodity
      ) {
        unchanged.push(record);
        continue;
      }

      /*
       * Check whether a normalized record with the same
       * logical identity already exists.
       */
      const duplicate = await MarketPrice.findOne({
        _id: {
          $ne: record._id,
        },
        market: record.market,
        commodity: normalizedCommodity,
        variety: record.variety,
        priceDate: record.priceDate,
        source: 'MSAMB',
      });

      if (duplicate) {
        const samePriceData =
          Number(duplicate.minimumPrice) ===
            Number(record.minimumPrice) &&
          Number(duplicate.maximumPrice) ===
            Number(record.maximumPrice) &&
          Number(duplicate.modalPrice) ===
            Number(record.modalPrice) &&
          Number(duplicate.arrivalQuantity || 0) ===
            Number(record.arrivalQuantity || 0) &&
          duplicate.unit === record.unit;

        if (samePriceData) {
          changes.push({
            type: 'duplicate_delete',
            id: record._id,
            oldCommodity,
            newCommodity: normalizedCommodity,
            duplicateId: duplicate._id,
            priceDate: record.priceDate,
            market: record.market,
          });
        } else {
          conflicts.push({
            id: record._id,
            oldCommodity,
            newCommodity: normalizedCommodity,
            duplicateId: duplicate._id,
            priceDate: record.priceDate,
            market: record.market,
            oldPrices: {
              minimum: record.minimumPrice,
              maximum: record.maximumPrice,
              modal: record.modalPrice,
            },
            newPrices: {
              minimum: duplicate.minimumPrice,
              maximum: duplicate.maximumPrice,
              modal: duplicate.modalPrice,
            },
          });
        }
      } else {
        changes.push({
          type: 'rename',
          id: record._id,
          oldCommodity,
          newCommodity: normalizedCommodity,
          priceDate: record.priceDate,
          market: record.market,
        });
      }
    }

    console.log('📋 Migration analysis');
    console.log('----------------------');
    console.log(`✅ Already normalized : ${unchanged.length}`);
    console.log(`🔄 Records to rename  : ${
      changes.filter((item) => item.type === 'rename').length
    }`);
    console.log(`🗑️ Duplicate records  : ${
      changes.filter((item) => item.type === 'duplicate_delete').length
    }`);
    console.log(`⚠️ Conflicts          : ${conflicts.length}`);
    console.log('');

    /*
     * Show commodity changes.
     */
    const commodityChanges = new Map();

    for (const change of changes) {
      if (!commodityChanges.has(change.oldCommodity)) {
        commodityChanges.set(
          change.oldCommodity,
          {
            newCommodity: change.newCommodity,
            count: 0,
          },
        );
      }

      commodityChanges.get(
        change.oldCommodity,
      ).count += 1;
    }

    if (commodityChanges.size > 0) {
      console.log('🔤 Commodity conversions');
      console.log('------------------------');

      for (const [
        oldCommodity,
        info,
      ] of commodityChanges.entries()) {
        console.log(
          `${oldCommodity} → ${info.newCommodity} (${info.count} record${
            info.count === 1 ? '' : 's'
          })`,
        );
      }

      console.log('');
    }

    /*
     * Show conflicts.
     */
    if (conflicts.length > 0) {
      console.log('⚠️ CONFLICTS DETECTED');
      console.log('---------------------');

      for (const conflict of conflicts) {
        console.log('');
        console.log(`Market: ${conflict.market}`);
        console.log(`Date: ${conflict.priceDate}`);
        console.log(
          `Old: ${conflict.oldCommodity} → ${conflict.newCommodity}`,
        );
        console.log(
          `Old prices: Min ${conflict.oldPrices.minimum}, ` +
            `Max ${conflict.oldPrices.maximum}, ` +
            `Modal ${conflict.oldPrices.modal}`,
        );
        console.log(
          `Existing normalized prices: Min ${conflict.newPrices.minimum}, ` +
            `Max ${conflict.newPrices.maximum}, ` +
            `Modal ${conflict.newPrices.modal}`,
        );
      }

      console.log('');
      console.log(
        '⚠️ Conflicting records will NOT be modified automatically.',
      );
      console.log('');
    }

    /*
     * Dry-run mode.
     */
    if (!APPLY_MODE) {
      console.log('🔍 DRY RUN MODE');
      console.log('---------------');
      console.log(
        'No database records were changed.',
      );
      console.log('');
      console.log(
        'If the above results look correct, run:',
      );
      console.log('');
      console.log(
        'node migrateMarketPriceCommodities.js --apply',
      );
      console.log('');

      process.exit(0);
    }

    /*
     * Create backup before modifying anything.
     */
    console.log('💾 Creating database backup...');

    const backupDirectory = path.join(
      __dirname,
      'backups',
    );

    if (!fs.existsSync(backupDirectory)) {
      fs.mkdirSync(backupDirectory, {
        recursive: true,
      });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-');

    const backupPath = path.join(
      backupDirectory,
      `market-price-backup-${timestamp}.json`,
    );

    fs.writeFileSync(
      backupPath,
      JSON.stringify(records, null, 2),
      'utf8',
    );

    console.log(`✅ Backup created:`);
    console.log(backupPath);
    console.log('');

    /*
     * Apply safe changes.
     */
    let renamedCount = 0;
    let deletedDuplicateCount = 0;
    let failedCount = 0;

    console.log('🔧 Applying migration...');
    console.log('');

    for (const change of changes) {
      try {
        if (change.type === 'rename') {
          await MarketPrice.updateOne(
            {
              _id: change.id,
            },
            {
              $set: {
                commodity: change.newCommodity,
              },
            },
          );

          renamedCount += 1;

          console.log(
            `🔄 ${change.oldCommodity} → ${change.newCommodity}`,
          );
        }

        if (change.type === 'duplicate_delete') {
          await MarketPrice.deleteOne({
            _id: change.id,
          });

          deletedDuplicateCount += 1;

          console.log(
            `🗑️ Removed duplicate: ${change.oldCommodity} → ${change.newCommodity}`,
          );
        }
      } catch (error) {
        failedCount += 1;

        console.error(
          `❌ Failed to migrate record ${change.id}:`,
          error.message,
        );
      }
    }

    console.log('');
    console.log('🎉 Migration complete');
    console.log('=====================');
    console.log(`🔄 Renamed records    : ${renamedCount}`);
    console.log(
      `🗑️ Deleted duplicates : ${deletedDuplicateCount}`,
    );
    console.log(`⚠️ Conflicts          : ${conflicts.length}`);
    console.log(`❌ Failed             : ${failedCount}`);
    console.log('');

    console.log(
      `💾 Backup available at: ${backupPath}`,
    );

    console.log('');
    console.log(
      '🌾 Commodity migration finished successfully.',
    );

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Migration failed');
    console.error('-------------------');
    console.error(error);
    console.error('');

    process.exit(1);
  }
};

runMigration();