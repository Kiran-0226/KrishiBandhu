require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const cropRoutes = require('./routes/cropRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const marketRoutes = require('./routes/marketRoutes');
const marketPriceRoutes = require('./routes/marketPriceRoutes');
const bidRoutes = require('./routes/bidRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const aiImageRoutes = require('./routes/aiImageRoutes');

const adminRoutes = require('./routes/adminRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');

const saleListingRoutes = require('./routes/saleListingRoutes');

const parchiRoutes = require('./routes/parchiRoutes');

const storageRoutes = require('./routes/storageRoutes');

const app = express();

connectDB();

const PORT = process.env.PORT || 5000;

// ==========================================
// SECURITY
// ==========================================

app.use(helmet());

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      'http://localhost:5173',
  }),
);

// ==========================================
// BODY PARSERS
// ==========================================

app.use(
  express.json({
    limit: '12mb',
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '12mb',
  }),
);

// ==========================================
// LOGGER
// ==========================================

app.use(morgan('dev'));

// ==========================================
// STATIC UPLOADS
// ==========================================

app.use(
  '/uploads',
  express.static(
    path.join(
      __dirname,
      'uploads',
    ),
  ),
);

// ==========================================
// HEALTH
// ==========================================

app.get(
  '/api/health',
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        'KrishiBandhu API is running',
      timestamp:
        new Date().toISOString(),
    });
  },
);

// ==========================================
// API ROOT
// ==========================================

app.get(
  '/api',
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        'Welcome to KrishiBandhu API',
      version: '1.0.0',
    });
  },
);

// ==========================================
// API ROUTES
// ==========================================

app.use(
  '/api/auth',
  authRoutes,
);

app.use(
  '/api/crops',
  cropRoutes,
);

app.use(
  '/api/weather',
  weatherRoutes,
);

app.use(
  '/api/markets',
  marketRoutes,
);

app.use(
  '/api/market-prices',
  marketPriceRoutes,
);

app.use(
  '/api/bids',
  bidRoutes,
);

app.use(
  '/api/transactions',
  transactionRoutes,
);

app.use(
  '/api/ai',
  aiRoutes,
);

app.use(
  '/api/ai/image',
  aiImageRoutes,
);

app.use(
  '/api/admin',
  adminRoutes,
);

app.use(
  '/api/admin/users',
  adminUserRoutes,
);

app.use(
  '/api/sale-listings',
  saleListingRoutes,
);

app.use(
  '/api/parchi',
  parchiRoutes,
);

app.use(
  '/api/storage',
  storageRoutes,
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        'API endpoint not found',
      path: req.originalUrl,
    });
  },
);

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (
    error,
    req,
    res,
    next,
  ) => {
    console.error('');
    console.error(
      '==========================================',
    );
    console.error(
      '🚨 UNHANDLED SERVER ERROR',
    );
    console.error(
      '==========================================',
    );

    console.error(
      'Method:',
      req.method,
    );

    console.error(
      'URL:',
      req.originalUrl,
    );

    console.error(
      'Error Name:',
      error?.name,
    );

    console.error(
      'Error Message:',
      error?.message,
    );

    console.error(
      'Error Stack:',
      error?.stack,
    );

    if (error?.errors) {
      console.error(
        'Validation Errors:',
        Object.fromEntries(
          Object.entries(
            error.errors,
          ).map(
            ([
              field,
              validationError,
            ]) => [
              field,
              validationError.message,
            ],
          ),
        ),
      );
    }

    console.error(
      '==========================================',
    );
    console.error('');

    const statusCode =
      error?.statusCode ||
      error?.status ||
      500;

    return res
      .status(
        statusCode >= 400 &&
          statusCode < 600
          ? statusCode
          : 500,
      )
      .json({
        success: false,

        message:
          process.env.NODE_ENV ===
          'development'
            ? error?.message ||
              'Internal server error.'
            : 'Internal server error.',

        error:
          process.env.NODE_ENV ===
          'development'
            ? {
                name:
                  error?.name,
                message:
                  error?.message,
                stack:
                  error?.stack,
              }
            : undefined,
      });
  },
);

// ==========================================
// START SERVER
// ==========================================

app.listen(
  PORT,
  () => {
    console.log('');
    console.log(
      '🌾 KrishiBandhu Backend',
    );
    console.log(
      '-------------------------',
    );
    console.log(
      `🚀 Server: http://localhost:${PORT}`,
    );
    console.log(
      `❤️  Health: http://localhost:${PORT}/api/health`,
    );
    console.log(
      `🔐 Auth: http://localhost:${PORT}/api/auth`,
    );
    console.log(
      `🌱 Crops: http://localhost:${PORT}/api/crops`,
    );
    console.log(
      `🌦️ Weather: http://localhost:${PORT}/api/weather?city=Bengaluru`,
    );
    console.log(
      `📈 Markets: http://localhost:${PORT}/api/markets`,
    );
    console.log(
      `💰 Market Prices: http://localhost:${PORT}/api/market-prices`,
    );
    console.log(
      `🤝 Bids: http://localhost:${PORT}/api/bids`,
    );
    console.log(
      `📒 Transactions: http://localhost:${PORT}/api/transactions`,
    );
    console.log(
      `🤖 AI Assistant: http://localhost:${PORT}/api/ai/chat`,
    );
    console.log(
      `📸 Crop Analysis: http://localhost:${PORT}/api/ai/image/analyze`,
    );
    console.log(
      `🛡️ Admin: http://localhost:${PORT}/api/admin`,
    );
    console.log(
      `👥 Admin Users: http://localhost:${PORT}/api/admin/users`,
    );
    console.log(
      `🛒 Sale Listings: http://localhost:${PORT}/api/sale-listings`,
    );
    console.log(
      `📄 Parchi: http://localhost:${PORT}/api/parchi`,
    );
    console.log(
      `🏭 Storage & Warehouses: http://localhost:${PORT}/api/storage`,
    );
    console.log(
      `📎 Uploads: http://localhost:${PORT}/uploads`,
    );
    console.log('');
  },
);