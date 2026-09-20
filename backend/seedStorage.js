require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('./config/db');
const StorageFacility = require('./models/StorageFacility');

const storageFacilities = [
  // ==========================================
  // COLD STORAGE
  // ==========================================

  {
    name: 'Pune Agro Cold Storage',
    type: 'cold_storage',
    description:
      'Demo cold storage facility for temperature-sensitive agricultural produce.',

    location: {
      address: 'Market Yard Road',
      village: 'Gultekdi',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411037',
      latitude: 18.5018,
      longitude: 73.8636,
    },

    capacity: 1000,
    capacityUnit: 'ton',
    availableCapacity: 650,

    suitableCrops: [
      'Tomato',
      'Potato',
      'Onion',
      'Apple',
      'Grapes',
      'Vegetables',
      'Fruits',
    ],

    temperatureRange: '2°C - 8°C',

    storageCharges: {
      amount: 1200,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000001001',
      alternatePhone: '9000002001',
      email: 'pune.cold@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 8:00 PM',

    facilities: [
      'Temperature Controlled',
      '24/7 Monitoring',
      'Loading & Unloading',
      'Power Backup',
      'CCTV Security',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Nashik Fresh Cold Storage',
    type: 'cold_storage',
    description:
      'Demo refrigerated storage facility designed for fruits and vegetables.',

    location: {
      address: 'Agricultural Market Road',
      village: 'Pimpalgaon Baswant',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422209',
      latitude: 20.1678,
      longitude: 73.9939,
    },

    capacity: 1500,
    capacityUnit: 'ton',
    availableCapacity: 900,

    suitableCrops: [
      'Grapes',
      'Onion',
      'Tomato',
      'Potato',
      'Pomegranate',
      'Vegetables',
      'Fruits',
    ],

    temperatureRange: '1°C - 8°C',

    storageCharges: {
      amount: 1100,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000001002',
      alternatePhone: '9000002002',
      email: 'nashik.cold@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 8:00 PM',

    facilities: [
      'Cold Rooms',
      'Temperature Monitoring',
      'Loading Dock',
      'Power Backup',
      'CCTV Security',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Sangli Vegetable Cold Store',
    type: 'cold_storage',
    description:
      'Demo cold storage facility suitable for vegetables and fruits.',

    location: {
      address: 'Market Yard Area',
      village: 'Sangli',
      district: 'Sangli',
      state: 'Maharashtra',
      pincode: '416416',
      latitude: 16.8524,
      longitude: 74.5815,
    },

    capacity: 800,
    capacityUnit: 'ton',
    availableCapacity: 420,

    suitableCrops: [
      'Tomato',
      'Onion',
      'Potato',
      'Grapes',
      'Vegetables',
    ],

    temperatureRange: '2°C - 7°C',

    storageCharges: {
      amount: 1000,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000001003',
      alternatePhone: '9000002003',
      email: 'sangli.cold@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 7:00 PM',

    facilities: [
      'Cold Storage',
      'Loading & Unloading',
      'CCTV Security',
      'Power Backup',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Kolhapur Agro Cold Storage',
    type: 'cold_storage',
    description:
      'Demo agricultural cold storage facility for perishable crops.',

    location: {
      address: 'Shiroli MIDC Road',
      village: 'Shiroli',
      district: 'Kolhapur',
      state: 'Maharashtra',
      pincode: '416122',
      latitude: 16.7502,
      longitude: 74.256,
    },

    capacity: 1200,
    capacityUnit: 'ton',
    availableCapacity: 780,

    suitableCrops: [
      'Potato',
      'Tomato',
      'Onion',
      'Fruits',
      'Vegetables',
    ],

    temperatureRange: '2°C - 8°C',

    storageCharges: {
      amount: 1050,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000001004',
      alternatePhone: '9000002004',
      email: 'kolhapur.cold@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 8:00 PM',

    facilities: [
      'Temperature Controlled',
      'Loading Dock',
      'Power Backup',
      'CCTV Security',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Jalgaon Fruit Cold Storage',
    type: 'cold_storage',
    description:
      'Demo cold storage facility focused on fruit and vegetable preservation.',

    location: {
      address: 'MIDC Agricultural Area',
      village: 'Jalgaon',
      district: 'Jalgaon',
      state: 'Maharashtra',
      pincode: '425001',
      latitude: 21.0077,
      longitude: 75.5626,
    },

    capacity: 1800,
    capacityUnit: 'ton',
    availableCapacity: 1250,

    suitableCrops: [
      'Banana',
      'Onion',
      'Tomato',
      'Potato',
      'Fruits',
      'Vegetables',
    ],

    temperatureRange: '1°C - 8°C',

    storageCharges: {
      amount: 950,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000001005',
      alternatePhone: '9000002005',
      email: 'jalgaon.cold@demo.krishibandhu.local',
    },

    operatingHours: '7:00 AM - 9:00 PM',

    facilities: [
      'Large Cold Rooms',
      'Temperature Monitoring',
      'Loading & Unloading',
      'Power Backup',
      'Security',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Nagpur Fresh Produce Cold Store',
    type: 'cold_storage',
    description:
      'Demo cold storage facility for fruits, vegetables and perishable agricultural produce.',

    location: {
      address: 'Kalmeshwar Road',
      village: 'Kalmeshwar',
      district: 'Nagpur',
      state: 'Maharashtra',
      pincode: '441501',
      latitude: 21.233,
      longitude: 78.9197,
    },

    capacity: 2000,
    capacityUnit: 'ton',
    availableCapacity: 1400,

    suitableCrops: [
      'Orange',
      'Tomato',
      'Potato',
      'Onion',
      'Vegetables',
      'Fruits',
    ],

    temperatureRange: '2°C - 8°C',

    storageCharges: {
      amount: 1150,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000001006',
      alternatePhone: '9000002006',
      email: 'nagpur.cold@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 8:00 PM',

    facilities: [
      'Temperature Controlled',
      'Loading Dock',
      'Power Backup',
      'CCTV Security',
      '24/7 Monitoring',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  // ==========================================
  // WAREHOUSES
  // ==========================================

  {
    name: 'Pune Agro Warehouse',
    type: 'warehouse',
    description:
      'Demo dry storage warehouse for grains, pulses and agricultural commodities.',

    location: {
      address: 'Market Yard Road',
      village: 'Gultekdi',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411037',
      latitude: 18.501,
      longitude: 73.864,
    },

    capacity: 2500,
    capacityUnit: 'ton',
    availableCapacity: 1700,

    suitableCrops: [
      'Wheat',
      'Rice',
      'Maize',
      'Soybean',
      'Pulses',
      'Grains',
    ],

    temperatureRange: 'Ambient / Dry Storage',

    storageCharges: {
      amount: 650,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000003001',
      alternatePhone: '9000004001',
      email: 'pune.warehouse@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 7:00 PM',

    facilities: [
      'Dry Storage',
      'Loading & Unloading',
      'Weighbridge',
      'CCTV Security',
      'Fire Safety',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Nashik Grain Warehouse',
    type: 'warehouse',
    description:
      'Demo warehouse for grains, pulses and selected agricultural commodities.',

    location: {
      address: 'Nashik Agricultural Market',
      village: 'Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      pincode: '422003',
      latitude: 20.0059,
      longitude: 73.7907,
    },

    capacity: 3000,
    capacityUnit: 'ton',
    availableCapacity: 2100,

    suitableCrops: [
      'Wheat',
      'Maize',
      'Soybean',
      'Pulses',
      'Grains',
    ],

    temperatureRange: 'Ambient / Dry Storage',

    storageCharges: {
      amount: 600,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000003002',
      alternatePhone: '9000004002',
      email: 'nashik.warehouse@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 7:00 PM',

    facilities: [
      'Dry Storage',
      'Weighbridge',
      'Loading Dock',
      'Fire Safety',
      'CCTV Security',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Solapur Agricultural Warehouse',
    type: 'warehouse',
    description:
      'Demo warehouse for storing grains, pulses and agricultural commodities.',

    location: {
      address: 'Solapur Market Area',
      village: 'Solapur',
      district: 'Solapur',
      state: 'Maharashtra',
      pincode: '413001',
      latitude: 17.6599,
      longitude: 75.9064,
    },

    capacity: 2200,
    capacityUnit: 'ton',
    availableCapacity: 1350,

    suitableCrops: [
      'Jowar',
      'Wheat',
      'Maize',
      'Pulses',
      'Soybean',
      'Grains',
    ],

    temperatureRange: 'Ambient / Dry Storage',

    storageCharges: {
      amount: 550,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000003003',
      alternatePhone: '9000004003',
      email: 'solapur.warehouse@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 6:00 PM',

    facilities: [
      'Dry Storage',
      'Weighbridge',
      'Loading & Unloading',
      'Fire Safety',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Akola Farmer Warehouse',
    type: 'warehouse',
    description:
      'Demo warehouse supporting storage of grains and farm commodities.',

    location: {
      address: 'Akola Agricultural Market',
      village: 'Akola',
      district: 'Akola',
      state: 'Maharashtra',
      pincode: '444001',
      latitude: 20.7002,
      longitude: 77.0082,
    },

    capacity: 2800,
    capacityUnit: 'ton',
    availableCapacity: 1950,

    suitableCrops: [
      'Soybean',
      'Cotton',
      'Wheat',
      'Pulses',
      'Maize',
      'Grains',
    ],

    temperatureRange: 'Ambient / Dry Storage',

    storageCharges: {
      amount: 580,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000003004',
      alternatePhone: '9000004004',
      email: 'akola.warehouse@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 7:00 PM',

    facilities: [
      'Dry Storage',
      'Weighbridge',
      'Loading Dock',
      'CCTV Security',
      'Fire Safety',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Amravati Agro Warehouse',
    type: 'warehouse',
    description:
      'Demo agricultural warehouse for grains, pulses and farm produce.',

    location: {
      address: 'Amravati Market Area',
      village: 'Amravati',
      district: 'Amravati',
      state: 'Maharashtra',
      pincode: '444601',
      latitude: 20.9374,
      longitude: 77.7796,
    },

    capacity: 2600,
    capacityUnit: 'ton',
    availableCapacity: 1650,

    suitableCrops: [
      'Soybean',
      'Wheat',
      'Cotton',
      'Pulses',
      'Maize',
      'Grains',
    ],

    temperatureRange: 'Ambient / Dry Storage',

    storageCharges: {
      amount: 570,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000003005',
      alternatePhone: '9000004005',
      email: 'amravati.warehouse@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 7:00 PM',

    facilities: [
      'Dry Storage',
      'Loading & Unloading',
      'Weighbridge',
      'Fire Safety',
      'Security',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },

  {
    name: 'Satara Agricultural Warehouse',
    type: 'warehouse',
    description:
      'Demo warehouse for grains, pulses and agricultural commodities.',

    location: {
      address: 'Satara Agricultural Market',
      village: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415001',
      latitude: 17.6805,
      longitude: 74.0183,
    },

    capacity: 1800,
    capacityUnit: 'ton',
    availableCapacity: 1100,

    suitableCrops: [
      'Wheat',
      'Maize',
      'Jowar',
      'Pulses',
      'Grains',
    ],

    temperatureRange: 'Ambient / Dry Storage',

    storageCharges: {
      amount: 600,
      unit: 'per ton/month',
    },

    contact: {
      phone: '9000003006',
      alternatePhone: '9000004006',
      email: 'satara.warehouse@demo.krishibandhu.local',
    },

    operatingHours: '8:00 AM - 6:00 PM',

    facilities: [
      'Dry Storage',
      'Loading Dock',
      'Weighbridge',
      'CCTV Security',
    ],

    isVerified: false,
    isActive: true,
    source: 'KrishiBandhu Demo',
  },
];

/*
 * ==========================================
 * Seed Storage Facilities
 * ==========================================
 */

const seedStorage = async () => {
  try {
    await connectDB();

    console.log('');
    console.log(
      '🏭 KrishiBandhu Storage Seeder',
    );
    console.log(
      '--------------------------------',
    );

    /*
     * Prevent duplicate seeding.
     */
    const existingCount =
      await StorageFacility.countDocuments();

    if (existingCount > 0) {
      console.log(
        `⚠️ Storage collection already contains ${existingCount} facilities.`,
      );

      console.log(
        'ℹ️ No new facilities were inserted.',
      );

      await mongoose.connection.close();

      process.exit(0);
    }

    const insertedFacilities =
      await StorageFacility.insertMany(
        storageFacilities,
      );

    const coldStorageCount =
      insertedFacilities.filter(
        (facility) =>
          facility.type === 'cold_storage',
      ).length;

    const warehouseCount =
      insertedFacilities.filter(
        (facility) =>
          facility.type === 'warehouse',
      ).length;

    console.log('');
    console.log(
      `✅ Inserted: ${insertedFacilities.length} facilities`,
    );

    console.log(
      `🧊 Cold Storage: ${coldStorageCount}`,
    );

    console.log(
      `🏭 Warehouses: ${warehouseCount}`,
    );

    console.log('');
    console.log(
      '📍 All seeded facilities are marked as:',
    );

    console.log(
      '   source: KrishiBandhu Demo',
    );

    console.log(
      '   isVerified: false',
    );

    console.log('');
    console.log(
      '🌾 Storage seeding completed successfully.',
    );

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error(
      '❌ Storage seeding failed:',
    );

    console.error(error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error(
        'Failed to close MongoDB connection:',
        closeError,
      );
    }

    process.exit(1);
  }
};

seedStorage();