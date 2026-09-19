const MarketPrice = require('../models/MarketPrice');
const Market = require('../models/Market');

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
};

const normalizeText = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase();
};

const getMarketPriceContext = async (query) => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return null;
  }

  // =========================================
  // Detect whether the user is asking about
  // market prices
  // =========================================

  const priceKeywords = [
    'price',
    'prices',
    'rate',
    'rates',
    'market price',
    'market prices',
    'mandi price',
    'mandi prices',
    'modal price',
    'selling price',
    'crop price',
  ];

  const isPriceQuestion = priceKeywords.some(
    (keyword) =>
      normalizedQuery.includes(keyword),
  );

  if (!isPriceQuestion) {
    return null;
  }

  // =========================================
  // Find possible Maharashtra market
  // =========================================

  const markets = await Market.find({
    state: 'Maharashtra',
  }).select(
    '_id name district state location',
  );

  let selectedMarket = null;

  for (const market of markets) {
    const marketName = normalizeText(
      market.name,
    );

    const districtName = normalizeText(
      market.district,
    );

    if (
      marketName &&
      normalizedQuery.includes(marketName)
    ) {
      selectedMarket = market;
      break;
    }

    if (
      districtName &&
      normalizedQuery.includes(districtName)
    ) {
      selectedMarket = market;
      break;
    }
  }

  // =========================================
  // Find possible commodity
  // =========================================

  const commodities =
    await MarketPrice.distinct(
      'commodity',
    );

  let selectedCommodity = null;

  // Longest names first so multi-word
  // commodities get priority.
  const sortedCommodities =
    commodities.sort(
      (a, b) =>
        String(b).length -
        String(a).length,
    );

  for (const commodity of sortedCommodities) {
    const commodityName =
      normalizeText(commodity);

    if (
      commodityName &&
      normalizedQuery.includes(
        commodityName,
      )
    ) {
      selectedCommodity = commodity;
      break;
    }
  }

  // =========================================
  // Common English aliases
  // =========================================

  if (!selectedCommodity) {
    const aliases = [
      {
        words: ['tomato', 'tomatoes'],
        commodity: 'Tomato',
      },
      {
        words: ['onion', 'onions'],
        commodity: 'Onion',
      },
      {
        words: ['potato', 'potatoes'],
        commodity: 'Potato',
      },
      {
        words: ['rice', 'paddy'],
        commodity: 'Paddy',
      },
      {
        words: ['brinjal', 'eggplant'],
        commodity: 'Brinjal',
      },
      {
        words: ['cabbage'],
        commodity: 'Cabbage',
      },
      {
        words: ['cauliflower'],
        commodity: 'Cauliflower',
      },
      {
        words: ['capsicum'],
        commodity: 'Capsicum',
      },
      {
        words: ['bottle gourd'],
        commodity: 'Bottle Gourd',
      },
    ];

    for (const alias of aliases) {
      if (
        alias.words.some((word) =>
          normalizedQuery.includes(word),
        )
      ) {
        selectedCommodity =
          alias.commodity;
        break;
      }
    }
  }

  // =========================================
  // Build database filter
  // =========================================

  const filter = {};

  if (selectedMarket) {
    filter.market =
      selectedMarket._id;
  }

  if (selectedCommodity) {
    filter.commodity = {
      $regex: `^${escapeRegex(
        selectedCommodity,
      )}$`,
      $options: 'i',
    };
  }

  // =========================================
  // Find latest available records
  // =========================================

  let latestDate = null;

  if (selectedCommodity) {
    const latestRecord =
      await MarketPrice.findOne({
        ...filter,
      })
        .sort({
          priceDate: -1,
        })
        .select('priceDate');

    if (latestRecord) {
      latestDate =
        latestRecord.priceDate;
    }
  }

  if (latestDate) {
    const startOfDay = new Date(
      latestDate,
    );

    startOfDay.setHours(
      0,
      0,
      0,
      0,
    );

    const endOfDay = new Date(
      latestDate,
    );

    endOfDay.setHours(
      23,
      59,
      59,
      999,
    );

    filter.priceDate = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  // =========================================
  // Fetch prices
  // =========================================

  const prices =
    await MarketPrice.find(filter)
      .populate(
        'market',
        'name district state location',
      )
      .sort({
        priceDate: -1,
        commodity: 1,
        variety: 1,
      })
      .limit(30)
      .lean();

  // =========================================
  // No matching records
  // =========================================

  if (prices.length === 0) {
    return {
      found: false,
      query,
      market: selectedMarket
        ? {
            name: selectedMarket.name,
            district:
              selectedMarket.district,
          }
        : null,
      commodity:
        selectedCommodity || null,
      records: [],
    };
  }

  // =========================================
  // Prepare AI-friendly data
  // =========================================

  const records = prices.map(
    (price) => ({
      market:
        price.market?.name || 'Unknown',
      district:
        price.market?.district ||
        'Unknown',
      state:
        price.market?.state ||
        'Maharashtra',
      commodity:
        price.commodity,
      variety:
        price.variety || '',
      unit:
        price.unit || 'quintal',
      arrivalQuantity:
        price.arrivalQuantity ?? null,
      minimumPrice:
        price.minimumPrice,
      maximumPrice:
        price.maximumPrice,
      modalPrice:
        price.modalPrice,
      priceDate:
        price.priceDate,
      source:
        price.source || 'MSAMB',
    }),
  );

  return {
    found: true,
    query,
    market: selectedMarket
      ? {
          name: selectedMarket.name,
          district:
            selectedMarket.district,
        }
      : null,
    commodity:
      selectedCommodity || null,
    records,
  };
};

module.exports = {
  getMarketPriceContext,
};