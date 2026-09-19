const {
  GoogleGenAI,
} = require('@google/genai');

const Market = require('../models/Market');
const MarketPrice = require('../models/MarketPrice');

/* =========================================================
   GEMINI
========================================================= */

const ai = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL =
  'gemini-3.6-flash';

/* =========================================================
   COMMODITY ALIASES
========================================================= */

const commodityAliases = [
  {
    commodity: 'Tomato',
    keywords: [
      'tomato',
      'tomatoes',
      'टमाटर',
    ],
  },

  {
    commodity: 'Onion',
    keywords: [
      'onion',
      'onions',
      'red onion',
      'white onion',
      'yellow onion',
      'onion bulb',
      'कांदा',
    ],
  },

  {
    commodity: 'Potato',
    keywords: [
      'potato',
      'potatoes',
      'बटाटा',
    ],
  },

  {
    commodity: 'Brinjal',
    keywords: [
      'brinjal',
      'eggplant',
      'aubergine',
      'वांगी',
    ],
  },

  {
    commodity: 'Cabbage',
    keywords: [
      'cabbage',
      'कोबी',
    ],
  },

  {
    commodity: 'Cauliflower',
    keywords: [
      'cauliflower',
      'फ्लॉवर',
    ],
  },

  {
    commodity: 'Capsicum',
    keywords: [
      'capsicum',
      'bell pepper',
      'green pepper',
      'shimla mirch',
      'ढोवळी मिरची',
    ],
  },

  {
    commodity: 'Bottle Gourd',
    keywords: [
      'bottle gourd',
      'lauki',
      'dudhi',
      'दुधी भोपळा',
    ],
  },

  {
    commodity: 'Pumpkin',
    keywords: [
      'pumpkin',
      'squash',
      'भोपळा',
    ],
  },

  {
    commodity: 'Garlic',
    keywords: [
      'garlic',
      'लसूण',
    ],
  },

  {
    commodity: 'Ginger',
    keywords: [
      'ginger',
      'आले',
    ],
  },

  {
    commodity: 'Paddy',
    keywords: [
      'paddy',
      'rice',
      'धान',
      'भात',
    ],
  },

  {
    commodity: 'Amaranth',
    keywords: [
      'amaranth',
      'राजगिरा',
    ],
  },

  {
    commodity: 'Colocasia',
    keywords: [
      'colocasia',
      'arvi',
      'arbi',
      'अर्वी',
    ],
  },

  {
    commodity: 'Sorrel Leaves',
    keywords: [
      'sorrel',
      'sorrel leaves',
      'आंबट चुका',
    ],
  },

  {
    commodity: 'Roselle Leaves',
    keywords: [
      'roselle',
      'roselle leaves',
      'अंबाडी भाजी',
    ],
  },
];

/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(
  value = '',
) {
  return String(value)
    .toLowerCase()
    .replace(/[(),.*_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* =========================================================
   DETECT COMMODITY
========================================================= */

function detectCommodity(
  message,
) {
  const normalized =
    normalizeText(message);

  for (
    const item of commodityAliases
  ) {
    const matched =
      item.keywords.some(
        (keyword) =>
          normalized.includes(
            normalizeText(
              keyword,
            ),
          ),
      );

    if (matched) {
      return item.commodity;
    }
  }

  return null;
}

/* =========================================================
   DETECT MARKET
========================================================= */

async function detectMarket(
  message,
) {
  const normalized =
    normalizeText(message);

  try {
    const markets =
      await Market.find({
        state: 'Maharashtra',
      })
        .select(
          '_id name district state isOfficial',
        )
        .lean();

    if (!markets.length) {
      return null;
    }

    /*
      First check complete market name.

      Example:
      "Pune APMC"
    */

    for (
      const market of markets
    ) {
      const marketName =
        normalizeText(
          market.name,
        );

      if (
        marketName &&
        normalized.includes(
          marketName,
        )
      ) {
        return market;
      }
    }

    /*
      Then check district.

      Example:
      "tomato price in Pune"
      -> Pune APMC
    */

    for (
      const market of markets
    ) {
      const district =
        normalizeText(
          market.district,
        );

      if (
        district &&
        normalized.includes(
          district,
        )
      ) {
        return market;
      }
    }

    return null;
  } catch (error) {
    console.error(
      'Market Detection Error:',
      error,
    );

    return null;
  }
}

/* =========================================================
   GET VERIFIED MARKET PRICE
========================================================= */

async function getVerifiedMarketPrice(
  message,
) {
  const commodity =
    detectCommodity(
      message,
    );

  /*
    Not every farming question is a
    market-price question.

    Example:
    "How do I grow onions?"
  */

  if (!commodity) {
    return null;
  }

  const market =
    await detectMarket(
      message,
    );

  /*
    Commodity detected but market
    not mentioned.
  */

  if (!market) {
    return {
      commodity,
      market: null,
      prices: null,
    };
  }

  try {
    const latestPrice =
      await MarketPrice.findOne({
        market: market._id,
        commodity,
      })
        .sort({
          priceDate: -1,
          createdAt: -1,
        })
        .lean();

    if (!latestPrice) {
      return {
        commodity,
        market,
        prices: null,
      };
    }

    return {
      commodity,
      market,
      prices: latestPrice,
    };
  } catch (error) {
    console.error(
      'Market Price Lookup Error:',
      error,
    );

    return {
      commodity,
      market,
      prices: null,
    };
  }
}

/* =========================================================
   BUILD MARKET CONTEXT
========================================================= */

function buildMarketContext(
  marketData,
) {
  if (!marketData) {
    return '';
  }

  /*
    Commodity found but no market.
  */

  if (!marketData.market) {
    return `
VERIFIED MARKET DATA

Commodity:
${marketData.commodity}

The farmer mentioned this commodity but did not specify
a market.

IMPORTANT:
Do not invent a market or market price.
If the farmer asks for a price, ask which market they mean.
`;
  }

  /*
    Market found but price unavailable.
  */

  if (!marketData.prices) {
    return `
VERIFIED MARKET DATA

Market:
${marketData.market.name}

District:
${marketData.market.district || 'Unknown'}

State:
${marketData.market.state || 'Maharashtra'}

Commodity:
${marketData.commodity}

No verified market-price record was found for this
commodity at this market.

IMPORTANT:
Do not invent or estimate a market price.
Tell the farmer that a verified price was not found.
`;
  }

  const {
    market,
    commodity,
    prices,
  } = marketData;

  const priceDate =
    prices.priceDate
      ? new Date(
          prices.priceDate,
        ).toLocaleDateString(
          'en-IN',
        )
      : 'Unknown';

  return `
VERIFIED MARKET DATA

Source:
${prices.source || 'MSAMB'}

Market:
${market.name}

District:
${market.district || 'Unknown'}

State:
${market.state || 'Maharashtra'}

Commodity:
${commodity}

Variety:
${prices.variety || 'Not specified'}

Unit:
${prices.unit || 'quintal'}

Minimum Price:
₹${prices.minimumPrice}

Modal Price:
₹${prices.modalPrice}

Maximum Price:
₹${prices.maximumPrice}

Price Date:
${priceDate}

MARKET PRICE RULES:

1. These prices come from KrishiBandhu's verified market database.
2. Do not invent, alter or replace these values.
3. Clearly mention the price date.
4. Clearly distinguish minimum, modal and maximum prices.
5. The stored MSAMB unit is generally quintal.
6. 1 quintal = 100 kg.
7. If the farmer asks for ₹/kg, divide the price by 100.
8. Never present these prices as guaranteed selling prices.
9. Actual selling price can vary based on quality, quantity,
   buyer, arrivals and auction conditions.
`;
}

/* =========================================================
   SYSTEM INSTRUCTION
========================================================= */

function buildSystemInstruction(
  marketContext,
) {
  return `
You are KrishiBandhu AI, an agricultural assistant
for farmers.

Your role is to provide practical, clear and trustworthy
agricultural information.

GENERAL RULES:

1. Use simple farmer-friendly language.
2. Give practical and actionable advice.
3. Use headings and bullet points when useful.
4. Keep answers reasonably concise.
5. Do not make unsupported claims.
6. Do not pretend to perform laboratory tests.
7. Do not give definitive plant disease diagnoses from
   symptoms alone.
8. Explain uncertainty when necessary.
9. Never fabricate market prices.
10. Never fabricate weather information.
11. Never claim an estimated selling price is guaranteed.

MARKET PRICE RULES:

When verified market data is provided:

- Use the supplied numbers exactly.
- Mention the market.
- Mention the commodity.
- Mention minimum price.
- Mention modal price.
- Mention maximum price.
- Mention the price date.
- Mention MSAMB as the source when appropriate.
- Stored prices are generally per quintal.
- 1 quintal = 100 kg.
- If asked for ₹/kg, divide the quintal price by 100.

When verified market data is NOT provided:

- Never invent a price.
- Explain that a verified price was not found.
- If no market was specified, ask the farmer for the market.

IMAGE ANALYSIS:

If discussing crop-image analysis:

- Explain that image analysis evaluates visible characteristics.
- Do not claim to detect internal problems that cannot be seen.
- Do not claim a definitive disease diagnosis.
- Any market-price estimate based on image quality is indicative only.
- Actual selling prices can differ.

${marketContext}
`;
}

/* =========================================================
   BUILD CHAT HISTORY
========================================================= */

function buildChatContents(
  history,
  message,
) {
  const contents = [];

  if (Array.isArray(history)) {
    for (
      const item of history
    ) {
      if (
        !item ||
        !item.content
      ) {
        continue;
      }

      const role =
        item.role === 'user'
          ? 'user'
          : 'model';

      contents.push({
        role,

        parts: [
          {
            text: String(
              item.content,
            ),
          },
        ],
      });
    }
  }

  /*
    Add current user message.
  */

  contents.push({
    role: 'user',

    parts: [
      {
        text: String(
          message,
        ),
      },
    ],
  });

  return contents;
}

/* =========================================================
   GENERATE AI RESPONSE
========================================================= */

async function generateAIResponse(
  message,
  history = [],
) {
  if (
    !message ||
    typeof message !== 'string' ||
    !message.trim()
  ) {
    throw new Error(
      'A valid message is required.',
    );
  }

  console.log('');
  console.log(
    '========================================',
  );
  console.log(
    '🤖 KrishiBandhu AI Chat',
  );
  console.log(
    '========================================',
  );

  console.log(
    `💬 Question: ${message}`,
  );

  /*
    Get verified market information
    before asking Gemini.
  */

  const marketData =
    await getVerifiedMarketPrice(
      message,
    );

  if (marketData?.commodity) {
    console.log(
      `🌱 Commodity: ${marketData.commodity}`,
    );
  }

  if (marketData?.market) {
    console.log(
      `📍 Market: ${marketData.market.name}`,
    );
  }

  if (marketData?.prices) {
    console.log(
      '✅ Verified market price found',
    );

    console.log(
      `📅 Date: ${marketData.prices.priceDate}`,
    );

    console.log(
      `💰 Minimum: ${marketData.prices.minimumPrice}`,
    );

    console.log(
      `💰 Modal: ${marketData.prices.modalPrice}`,
    );

    console.log(
      `💰 Maximum: ${marketData.prices.maximumPrice}`,
    );
  }

  const marketContext =
    buildMarketContext(
      marketData,
    );

  const systemInstruction =
    buildSystemInstruction(
      marketContext,
    );

  const contents =
    buildChatContents(
      history,
      message.trim(),
    );

  try {
    const response =
      await ai.models.generateContent({
        model:
          GEMINI_MODEL,

        contents,

        config: {
          systemInstruction,

          temperature: 0.4,

          maxOutputTokens: 1200,
        },
      });

    const responseText =
      response?.text;

    if (
      !responseText ||
      typeof responseText !==
        'string'
    ) {
      throw new Error(
        'Gemini returned an empty response.',
      );
    }

    console.log(
      '✅ Gemini response received',
    );

    console.log(
      '========================================',
    );
    console.log('');

    return responseText.trim();
  } catch (error) {
    console.error('');
    console.error(
      '========================================',
    );
    console.error(
      '❌ Gemini AI Error',
    );
    console.error(
      '========================================',
    );
    console.error(
      error,
    );
    console.error(
      '========================================',
    );
    console.error('');

    throw new Error(
      'Unable to get a response from AI.',
    );
  }
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  generateAIResponse,
};