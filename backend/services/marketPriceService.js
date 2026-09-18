const cheerio = require('cheerio');

const Market = require('../models/Market');
const MarketPrice = require('../models/MarketPrice');

const MSAMB_URL = 'https://www.msamb.com/Sakal.aspx';

// =========================================
// Fetch MSAMB Page
// =========================================

const fetchMSAMBPage = async () => {
  const response = await fetch(MSAMB_URL);

  if (!response.ok) {
    throw new Error(
      `MSAMB request failed with status ${response.status}`,
    );
  }

  return await response.text();
};

// =========================================
// Text Helpers
// =========================================

const cleanText = (value) => {
  if (!value) {
    return '';
  }

  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeDigits = (value) => {
  if (!value) {
    return '';
  }

  const digitMap = {
    '०': '0',
    '१': '1',
    '२': '2',
    '३': '3',
    '४': '4',
    '५': '5',
    '६': '6',
    '७': '7',
    '८': '8',
    '९': '9',
  };

  return String(value).replace(
    /[०-९]/g,
    (digit) => digitMap[digit] || digit,
  );
};

const convertToNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return undefined;
  }

  const normalized = normalizeDigits(
    String(value),
  )
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '');

  if (!normalized) {
    return undefined;
  }

  const number = Number(normalized);

  return Number.isNaN(number)
    ? undefined
    : number;
};

// =========================================
// Commodity Normalization
// =========================================

const commodityMap = {
  // =======================================
  // Pulses / Grains / Oilseeds
  // =======================================

    'अंबाडी भाजी': 'Roselle Leaves',
  'अर्वी': 'Colocasia',
  'आंबट चुका': 'Sorrel Leaves',
  'कोबी': 'Cabbage',
  'टोमॅटो': 'Tomato',
  'ढोवळी मिरची': 'Capsicum',
  'दुधी भोपळा': 'Bottle Gourd',
  'फ्लॉवर': 'Cauliflower',
  'बटाटा': 'Potato',
  'भात - धान': 'Paddy',
  'राजगिरा': 'Amaranth',
  'वांगी': 'Brinjal',
  
  'नाचणी/ नागली': 'Finger Millet',
  'नाचणी / नागली': 'Finger Millet',
  'नाचणी': 'Finger Millet',
  'नागली': 'Finger Millet',
  'Finger Millet': 'Finger Millet',

  'चवळी बी': 'Cowpea Seed',
  'Cowpea Seed': 'Cowpea Seed',

  'हरभरा': 'Gram',
  'हरभरा डाळ': 'Gram Dal',
  'Gram': 'Gram',
  'Gram Dal': 'Gram Dal',

  'मसूर': 'Lentil',
  'मसूर डाळ': 'Lentil Dal',
  'Lentil': 'Lentil',
  'Lentil Dal': 'Lentil Dal',

  'मटकी': 'Moth Bean',
  'Moth Bean': 'Moth Bean',

  'मूग': 'Green Gram',
  'मूग डाळ': 'Green Gram Dal',
  'Green Gram': 'Green Gram',
  'Green Gram Dal': 'Green Gram Dal',

  'तूर': 'Tur',
  'तूर डाळ': 'Tur Dal',
  'Tur': 'Tur',
  'Tur Dal': 'Tur Dal',

  'उडीद': 'Black Gram',
  'उडीद डाळ': 'Black Gram Dal',
  'Black Gram': 'Black Gram',
  'Black Gram Dal': 'Black Gram Dal',

  'वाल': 'Field Bean',
  'घेवडा': 'Field Bean',
  'पावटा (भाजी)': 'Field Bean',
  'वालवड': 'Field Bean',
  'Field Bean': 'Field Bean',

  'वाल भाजी': 'Field Bean Greens',
  'Field Bean Greens': 'Field Bean Greens',

  'वाल पापडी': 'Field Bean Pods',
  'Field Bean Pods': 'Field Bean Pods',

  'वाटाणा': 'Green Peas',
  'मटार': 'Green Peas',
  'Green Peas': 'Green Peas',

  'बडिशेप': 'Fennel',
  'Fennel': 'Fennel',

  'एरंडी': 'Castor Seed',
  'Castor Seed': 'Castor Seed',

  'शेंगदाणे': 'Groundnut',
  'Groundnut': 'Groundnut',

  'भुईमुग शेंग (ओली)': 'Fresh Groundnut',
  'Fresh Groundnut': 'Fresh Groundnut',

  'भुईमुग शेंग (सुकी)': 'Dry Groundnut',
  'Dry Groundnut': 'Dry Groundnut',

  'सोयाबिन': 'Soybean',
  'Soybean': 'Soybean',

  'तील': 'Sesame',
  'Sesame': 'Sesame',

  'चिया बी': 'Chia Seed',
  'Chia Seed': 'Chia Seed',

  'ज्वारी': 'Jowar',
  'ज्वार': 'Jowar',
  'Jowar': 'Jowar',

  'बाजरी': 'Bajra',
  'बाजरा': 'Bajra',
  'Bajra': 'Bajra',

  'गहू': 'Wheat',
  'Wheat': 'Wheat',

  'मका': 'Maize',
  'मका (कणीस)': 'Maize',
  'Maize': 'Maize',

  'तांदूळ': 'Rice',
  'तांदुळ': 'Rice',
  'Rice': 'Rice',

  'भात': 'Paddy',
  'Paddy': 'Paddy',

  'साखर': 'Sugar',
  'Sugar': 'Sugar',

  'गुळ': 'Jaggery',
  'गूळ': 'Jaggery',
  'Jaggery': 'Jaggery',

  // =======================================
  // Vegetables
  // =======================================

  'कांदा': 'Onion',
  'Onion': 'Onion',

  'लसूण': 'Garlic',
  'Garlic': 'Garlic',

  'लसूण (सुका)': 'Dry Garlic',
  'Dry Garlic': 'Dry Garlic',

  'आले': 'Ginger',
  'Ginger': 'Ginger',

  'आले (सुंठ)': 'Dry Ginger',
  'सुंठ': 'Dry Ginger',
  'Dry Ginger': 'Dry Ginger',

  'बीट': 'Beetroot',
  'Beetroot': 'Beetroot',

  'भेडी': 'Okra',
  'भेंडी': 'Okra',
  'Okra': 'Okra',

  'भोपळा': 'Pumpkin',
  'Pumpkin': 'Pumpkin',

  'चाकवत': 'Bathua Greens',
  'Bathua Greens': 'Bathua Greens',

  'चवळी (शेंगा)': 'Cowpea Pods',
  'Cowpea Pods': 'Cowpea Pods',

  'चवळी (पाला)': 'Cowpea Leaves',
  'Cowpea Leaves': 'Cowpea Leaves',

  'ढेमसे': 'Round Gourd',
  'Round Gourd': 'Round Gourd',

  'फरस बी': 'French Bean Seed',
  'French Bean Seed': 'French Bean Seed',

  'गाजर': 'Carrot',
  'Carrot': 'Carrot',

  'गवार': 'Cluster Beans',
  'Cluster Beans': 'Cluster Beans',

  'घोसाळी (भाजी)': 'Ridge Gourd',
  'दोडका (शिराळी)': 'Ridge Gourd',
  'Ridge Gourd': 'Ridge Gourd',

  'कढिपत्ता': 'Curry Leaves',
  'कडीपत्ता': 'Curry Leaves',
  'Curry Leaves': 'Curry Leaves',

  'कैरी': 'Raw Mango',
  'Raw Mango': 'Raw Mango',

  'काकडी': 'Cucumber',
  'Cucumber': 'Cucumber',

  'कांदा पात': 'Spring Onion',
  'Spring Onion': 'Spring Onion',

  'करडई (भाजी)': 'Safflower',
  'Safflower': 'Safflower',

  'कारली': 'Bitter Gourd',
  'Bitter Gourd': 'Bitter Gourd',

  'केळी (कच्ची)': 'Raw Banana',
  'Raw Banana': 'Raw Banana',

  'कोहळा': 'Ash Gourd',
  'Ash Gourd': 'Ash Gourd',

  'कोथिंबिर': 'Coriander Leaves',
  'कोथिंबीर': 'Coriander Leaves',
  'Coriander Leaves': 'Coriander Leaves',

  'मुळा': 'Radish',
  'Radish': 'Radish',

  'पडवळ': 'Snake Gourd',
  'Snake Gourd': 'Snake Gourd',

  'पालक': 'Spinach',
  'Spinach': 'Spinach',

  'पपई (भाजी)': 'Raw Papaya',
  'Raw Papaya': 'Raw Papaya',

  'परवर': 'Pointed Gourd',
  'Pointed Gourd': 'Pointed Gourd',

  'पुदिना': 'Mint',
  'Mint': 'Mint',

  'रताळी': 'Sweet Potato',
  'Sweet Potato': 'Sweet Potato',

  'शेपू': 'Dill Leaves',
  'Dill Leaves': 'Dill Leaves',

  'शेवगा': 'Drumstick',
  'Drumstick': 'Drumstick',

  'सुरण': 'Elephant Foot Yam',
  'Elephant Foot Yam': 'Elephant Foot Yam',

  'तांदुळजा': 'Amaranth Greens',
  'Amaranth Greens': 'Amaranth Greens',

  'तोंडली': 'Ivy Gourd',
  'Ivy Gourd': 'Ivy Gourd',

  'भुईमुग': 'Groundnut',

  // =======================================
  // Fruits
  // =======================================

  'नारळ': 'Coconut',
  'Coconut': 'Coconut',

  'अननस': 'Pineapple',
  'Pineapple': 'Pineapple',

  'बोर': 'Indian Jujube',
  'Indian Jujube': 'Indian Jujube',

  'चिकु': 'Sapota',
  'चिकू': 'Sapota',
  'Sapota': 'Sapota',

  'डाळींब': 'Pomegranate',
  'डाळिंब': 'Pomegranate',
  'Pomegranate': 'Pomegranate',

  'कलिंगड': 'Watermelon',
  'Watermelon': 'Watermelon',

  'मोसंबी': 'Sweet Lime',
  'Sweet Lime': 'Sweet Lime',

  'पेरु': 'Guava',
  'पेरू': 'Guava',
  'Guava': 'Guava',

  'सिताफळ': 'Custard Apple',
  'सीताफळ': 'Custard Apple',
  'Custard Apple': 'Custard Apple',

  'खरबुज': 'Muskmelon',
  'खरबूज': 'Muskmelon',
  'Muskmelon': 'Muskmelon',

  'शहाळे': 'Tender Coconut',
  'Tender Coconut': 'Tender Coconut',

  'ड्रॅगन फ्रुट': 'Dragon Fruit',
  'ड्रॅगन फ्रूट': 'Dragon Fruit',
  'Dragon Fruit': 'Dragon Fruit',

  'आवळा': 'Amla',
  'Amla': 'Amla',

  'केळी': 'Banana',
  'Banana': 'Banana',

  'सफरचंद': 'Apple',
  'Apple': 'Apple',

  'संत्रे': 'Orange',
  'संत्री': 'Orange',
  'Orange': 'Orange',

  'लिंबू': 'Lemon',
  'Lemon': 'Lemon',

  'चिकू': 'Sapota',

  'डाळिंब': 'Pomegranate',

  'पपई': 'Papaya',
  'Papaya': 'Papaya',

  'आंबा': 'Mango',
  'Mango': 'Mango',

  'फणस (भाजी)': 'Raw Jackfruit',
  'Raw Jackfruit': 'Raw Jackfruit',

  // =======================================
  // Spices / Dry Fruits
  // =======================================

  'चिंच': 'Tamarind',
  'Tamarind': 'Tamarind',

  'चिंचोका': 'Tamarind Seed',
  'Tamarind Seed': 'Tamarind Seed',

  'धने': 'Coriander Seed',
  'Coriander Seed': 'Coriander Seed',

  'हळद/ हळकुंड': 'Turmeric',
  'हळद / हळकुंड': 'Turmeric',
  'हळद': 'Turmeric',
  'Turmeric': 'Turmeric',

  'जिरे': 'Cumin',
  'Cumin': 'Cumin',

  'काजू': 'Cashew',
  'Cashew': 'Cashew',

  'मेथी बी': 'Fenugreek Seed',
  'Fenugreek Seed': 'Fenugreek Seed',

  'मेथी भाजी': 'Fenugreek Leaves',
  'Fenugreek Leaves': 'Fenugreek Leaves',

  'मिरची (हिरवी)': 'Green Chilli',
  'Green Chilli': 'Green Chilli',

  'मिरची (लाल)': 'Red Chilli',
  'Red Chilli': 'Red Chilli',

  'मोहरी': 'Mustard',
  'Mustard': 'Mustard',

  'सुपारी': 'Arecanut',
  'Arecanut': 'Arecanut',

  'वेलची': 'Cardamom',
  'Cardamom': 'Cardamom',

  'मिरे': 'Black Pepper',
  'Black Pepper': 'Black Pepper',

  'दालचिनी': 'Cinnamon',
  'Cinnamon': 'Cinnamon',

  'बदाम': 'Almond',
  'Almond': 'Almond',

  'बेदाणा': 'Raisins',
  'Raisins': 'Raisins',

  'पिस्ता': 'Pistachio',
  'Pistachio': 'Pistachio',

  'अंजीर (सुके)': 'Dry Fig',
  'Dry Fig': 'Dry Fig',

  // =======================================
  // Flowers
  // =======================================

  'अस्टर': 'Aster',
  'Aster': 'Aster',

  'गुलाब': 'Rose',
  'Rose': 'Rose',

  'गुलछडी/निशिगंध': 'Tuberose',
  'गुलछडी / निशिगंध': 'Tuberose',
  'Tuberose': 'Tuberose',

  'जास्वंद': 'Hibiscus',
  'Hibiscus': 'Hibiscus',

  'शेवंती': 'Chrysanthemum',
  'Chrysanthemum': 'Chrysanthemum',

  'झेंडू': 'Marigold',
  'Marigold': 'Marigold',

  'जुई': 'Jasmine',
  'Jasmine': 'Jasmine',

  // These are retained as source trade/variety names
  'कागडा': 'Kagda',
  'Kagda': 'Kagda',

  'तुळजापुरी': 'Tuljapuri',
  'Tuljapuri': 'Tuljapuri',

  'बिजली': 'Bijli',
  'Bijli': 'Bijli',

  'चाफा': 'Plumeria',
  'Plumeria': 'Plumeria',

  'गलटॅाप': 'Gladiolus',
  'ग्लॅडीओ': 'Gladiolus',
  'Gladiolus': 'Gladiolus',

  'गोल्डन / डि.जी': 'Golden / DG',
  'Golden / DG': 'Golden / DG',

  'जिप्सि': 'Gypsophila',
  'Gypsophila': 'Gypsophila',

  'जरबेरा': 'Gerbera',
  'Gerbera': 'Gerbera',

  'कार्नेशन': 'Carnation',
  'Carnation': 'Carnation',

  'बटबटी': 'Hyacinth Bean',
  'Hyacinth Bean': 'Hyacinth Bean',

  // =======================================
  // Other
  // =======================================

  'सागु': 'Sago',
  'साबुदाणा': 'Sago',
  'Sago': 'Sago',

  'बदाम': 'Almond',

  'कापूस': 'Cotton',
  'Cotton': 'Cotton',

  'रेशीम कोष': 'Silk Cocoon',
  'रेशीम कोषा': 'Silk Cocoon',
  'Silk Cocoon': 'Silk Cocoon',
};

// =========================================
// Normalize Commodity
// =========================================

const normalizeCommodity = (value) => {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return '';
  }

  return (
    commodityMap[cleaned] ||
    cleaned
  );
};

// =========================================
// Market Normalization
// =========================================

const marketMap = {
  // Pune
  'पुणे': 'Pune APMC',
  'बारामती': 'Baramati APMC',
  'जुन्नर': 'Junnar APMC',
  'खेड': 'Khed APMC',
  'मंचर': 'Manchar APMC',
  'अकलुज': 'Akluj APMC',

  // Nashik
  'नाशिक': 'Nashik APMC',
  'लासलगाव': 'Lasalgaon APMC',
  'पिंपळगाव बसवंत': 'Pimpalgaon Baswant APMC',

  // Latur
  'लातूर': 'Latur APMC',
  'उदगीर': 'Udgir APMC',

  // Nagpur
  'नागपूर': 'Nagpur APMC',
  'काटोल': 'Katol APMC',

  // Solapur
  'सोलापूर': 'Solapur APMC',
  'पंढरपूर': 'Pandharpur APMC',
  'करमाळा': 'Karmala APMC',

  // Sangli
  'सांगली': 'Sangli APMC',
  'कराड': 'Karad APMC',

  // Kolhapur
  'कोल्हापूर': 'Kolhapur APMC',

  // Raigad
  'पनवेल': 'Panvel APMC',

  // Amravati
  'अमरावती': 'Amravati APMC',
  'अकोट': 'Akot APMC',

  // Akola
  'अकोला': 'Akola APMC',

  // Ahilyanagar
  'अहिल्यानगर': 'Ahilyanagar APMC',

  // Gadchiroli
  'आरमोरी': 'Armori APMC',
  'आर्मोरी': 'Armori APMC',

  // Gondia
  'गोंदिया': 'Gondia APMC',

  // Jalgaon
  'जळगाव': 'Jalgaon APMC',

  // Dharashiv
  'धाराशिव': 'Dharashiv APMC',

  // Dhule
  'धुळे': 'Dhule APMC',

  // Mumbai
  'मुंबई': 'Mumbai APMC',

  // Ratnagiri
  'रत्नागिरी': 'Ratnagiri APMC',

  // Washim
  'वाशीम': 'Washim APMC',

  // Satara
  'सातारा': 'Satara APMC',

  // Chhatrapati Sambhajinagar
  'छत्रपती संभाजीनगर':
    'Chhatrapati Sambhajinagar APMC',
};

const normalizeMarketName = (value) => {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return '';
  }

  return (
    marketMap[cleaned] ||
    cleaned
  );
};

// =========================================
// Unit Normalization
// =========================================

const normalizeUnit = (value) => {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return '';
  }

  const unitMap = {
    'क्विंटल': 'quintal',
    'क्विंटल ': 'quintal',
    'किलो': 'kg',
    'कि.ग्रॅ.': 'kg',
    'कि. ग्रॅ.': 'kg',
    'नग': 'piece',
    'पिशवी': 'bag',
    'टन': 'ton',
  };

  return (
    unitMap[cleaned] ||
    cleaned
  );
};

// =========================================
// Variety Normalization
// =========================================

const normalizeVariety = (value) => {
  return cleanText(value);
};

// =========================================
// Date Parsing
// =========================================

const parseMSAMBDate = (value) => {
  const cleaned = normalizeDigits(
    cleanText(value),
  );

  const match = cleaned.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  );

  if (!match) {
    return undefined;
  }

  const [
    ,
    day,
    month,
    year,
  ] = match;

  return `${year}-${month.padStart(
    2,
    '0',
  )}-${day.padStart(2, '0')}`;
};

// =========================================
// Parse MSAMB HTML
// =========================================

const parseMSAMBPrices = (html) => {
  const $ = cheerio.load(html);

  const records = [];

  $('table tr').each(
    (index, row) => {
      const cells = $(row)
        .find('td')
        .map((_, cell) =>
          cleanText(
            $(cell).text(),
          ),
        )
        .get();

      if (cells.length < 8) {
        return;
      }

      const [
        date,
        commodity,
        market,
        variety,
        unit,
        arrivalQuantity,
        minimumPrice,
        maximumPrice,
        modalPrice,
      ] = cells;

      if (
        !date ||
        !commodity ||
        !market ||
        !unit
      ) {
        return;
      }

      const priceDate =
        parseMSAMBDate(date);

      if (!priceDate) {
        return;
      }

      const minimum =
        convertToNumber(
          minimumPrice,
        );

      const maximum =
        convertToNumber(
          maximumPrice,
        );

      const modal =
        convertToNumber(
          modalPrice,
        );

      if (
        minimum === undefined ||
        maximum === undefined ||
        modal === undefined
      ) {
        return;
      }

      records.push({
        marketName:
          normalizeMarketName(
            market,
          ),

        commodity:
          normalizeCommodity(
            commodity,
          ),

        variety:
          normalizeVariety(
            variety,
          ),

        unit:
          normalizeUnit(unit),

        arrivalQuantity:
          convertToNumber(
            arrivalQuantity,
          ),

        minimumPrice:
          minimum,

        maximumPrice:
          maximum,

        modalPrice:
          modal,

        priceDate,

        source: 'MSAMB',
      });
    },
  );

  return records;
};

// =========================================
// Get Official MSAMB Prices
// =========================================

const getOfficialMSAMBPrices =
  async () => {
    const html =
      await fetchMSAMBPage();

    return parseMSAMBPrices(html);
  };

// =========================================
// Find Matching Market
// =========================================

const findMatchingMarket =
  async (marketName) => {
    const market =
      await Market.findOne({
        name: marketName,
        state: 'Maharashtra',
      });

    return market;
  };

// =========================================
// Sync MSAMB Prices to MongoDB
// =========================================
//
// MSAMB can contain multiple rows with
// the same market + commodity + variety
// + date.
//
// Therefore those fields are NOT treated
// as a unique key.
//
// Instead, every market/date combination
// returned by MSAMB is treated as a fresh
// daily snapshot.
//
// Existing records for that exact
// market/date are removed and replaced
// with the complete fresh MSAMB snapshot.
//
// This preserves legitimate multiple rows
// and prevents duplicate accumulation.
// =========================================

const syncMSAMBPrices =
  async () => {
    console.log('');
    console.log(
      '🌾 Starting MSAMB price sync...',
    );
    console.log(
      '--------------------------------',
    );

    const records =
      await getOfficialMSAMBPrices();

    console.log(
      `📥 MSAMB records fetched: ${records.length}`,
    );

    // Safety check
    if (records.length === 0) {
      console.log(
        '⚠️ No records received from MSAMB.',
      );

      console.log(
        '🛑 Existing database records were not changed.',
      );

      return {
        success: false,
        fetchedCount: 0,
        insertedCount: 0,
        deletedCount: 0,
        skippedMarketCount: 0,
        skippedRecordCount: 0,
        skippedMarkets: [],
      };
    }

    let insertedCount = 0;
    let deletedCount = 0;
    let skippedMarketCount = 0;
    let skippedRecordCount = 0;

    const skippedMarkets =
      new Set();

    // =======================================
    // Resolve markets
    // =======================================

    const marketCache =
      new Map();

    for (const record of records) {
      if (
        marketCache.has(
          record.marketName,
        )
      ) {
        continue;
      }

      const market =
        await findMatchingMarket(
          record.marketName,
        );

      marketCache.set(
        record.marketName,
        market || null,
      );

      if (!market) {
        skippedMarkets.add(
          record.marketName,
        );
      }
    }

    // =======================================
    // Group records by market/date
    // =======================================

    const snapshotGroups =
      new Map();

    for (const record of records) {
      const market =
        marketCache.get(
          record.marketName,
        );

      if (!market) {
        skippedMarketCount++;
        continue;
      }

      const priceDate =
        new Date(record.priceDate);

      if (
        Number.isNaN(
          priceDate.getTime(),
        )
      ) {
        skippedRecordCount++;
        continue;
      }

      const dateKey =
        priceDate
          .toISOString()
          .slice(0, 10);

      const groupKey =
        `${market._id.toString()}|${dateKey}`;

      if (
        !snapshotGroups.has(
          groupKey,
        )
      ) {
        snapshotGroups.set(
          groupKey,
          {
            market,
            priceDate,
            records: [],
          },
        );
      }

      snapshotGroups
        .get(groupKey)
        .records.push(record);
    }

    console.log('');
    console.log(
      `📦 Market/date snapshots: ${snapshotGroups.size}`,
    );

    // =======================================
    // Replace each snapshot
    // =======================================

    for (const [
      groupKey,
      snapshot,
    ] of snapshotGroups.entries()) {
      try {
        const startOfDay =
          new Date(
            snapshot.priceDate,
          );

        startOfDay.setHours(
          0,
          0,
          0,
          0,
        );

        const endOfDay =
          new Date(startOfDay);

        endOfDay.setDate(
          endOfDay.getDate() + 1,
        );

        // -----------------------------------
        // Delete old snapshot
        // -----------------------------------

        const deleteResult =
          await MarketPrice.deleteMany(
            {
              market:
                snapshot.market._id,

              source: 'MSAMB',

              priceDate: {
                $gte: startOfDay,
                $lt: endOfDay,
              },
            },
          );

        deletedCount +=
          deleteResult.deletedCount || 0;

        // -----------------------------------
        // Create fresh documents
        // -----------------------------------

        const documents =
          snapshot.records.map(
            (record) => ({
              market:
                snapshot.market._id,

              commodity:
                record.commodity,

              variety:
                record.variety,

              unit:
                record.unit,

              arrivalQuantity:
                record.arrivalQuantity,

              minimumPrice:
                record.minimumPrice,

              maximumPrice:
                record.maximumPrice,

              modalPrice:
                record.modalPrice,

              priceDate:
                snapshot.priceDate,

              source: 'MSAMB',
            }),
          );

        // -----------------------------------
        // Insert fresh snapshot
        // -----------------------------------

        if (
          documents.length > 0
        ) {
          await MarketPrice.insertMany(
            documents,
            {
              ordered: true,
            },
          );

          insertedCount +=
            documents.length;
        }

        console.log(
          `✅ ${snapshot.market.name} | ${
            snapshot.priceDate
              .toISOString()
              .slice(0, 10)
          } | ${documents.length} records`,
        );
      } catch (error) {
        console.error('');
        console.error(
          `❌ Snapshot failed: ${groupKey}`,
        );
        console.error(
          error.message,
        );

        skippedRecordCount +=
          snapshot.records.length;
      }
    }

    // =======================================
    // Final Summary
    // =======================================

    console.log('');
    console.log(
      '🎉 MSAMB sync completed',
    );
    console.log(
      '-----------------------',
    );

    console.log(
      `📥 Fetched records      : ${records.length}`,
    );

    console.log(
      `🗑️ Old records removed  : ${deletedCount}`,
    );

    console.log(
      `➕ New records inserted : ${insertedCount}`,
    );

    console.log(
      `⚠️ Skipped markets      : ${skippedMarketCount}`,
    );

    console.log(
      `❌ Skipped records      : ${skippedRecordCount}`,
    );

    if (
      skippedMarkets.size > 0
    ) {
      console.log('');
      console.log(
        '🏪 Markets not found in database:',
      );

      for (
        const marketName of
          skippedMarkets
      ) {
        console.log(
          `   - ${marketName}`,
        );
      }
    }

    console.log('');

    return {
      success: true,
      fetchedCount:
        records.length,
      insertedCount,
      deletedCount,
      skippedMarketCount,
      skippedRecordCount,
      skippedMarkets:
        Array.from(
          skippedMarkets,
        ),
    };
  };

// =========================================
// Exports
// =========================================

module.exports = {
  fetchMSAMBPage,
  parseMSAMBPrices,
  getOfficialMSAMBPrices,
  syncMSAMBPrices,
  normalizeCommodity,
};