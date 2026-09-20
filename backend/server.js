require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');

// ==========================================
// Application Routes
// ==========================================

const authRoutes = require('./routes/authRoutes');

const cropRoutes = require('./routes/cropRoutes');

const weatherRoutes = require('./routes/weatherRoutes');

const marketRoutes = require('./routes/marketRoutes');

const marketPriceRoutes = require('./routes/marketPriceRoutes');

const bidRoutes = require('./routes/bidRoutes');

const transactionRoutes = require('./routes/transactionRoutes');

const aiRoutes = require('./routes/aiRoutes');

const aiImageRoutes = require('./routes/aiImageRoutes');

// ==========================================
// Admin Routes
// ==========================================

const adminRoutes = require('./routes/adminRoutes');

const adminUserRoutes = require('./routes/adminUserRoutes');

// ==========================================
// Marketplace Routes
// ==========================================

const saleListingRoutes = require('./routes/saleListingRoutes');

// ==========================================
// Parchi Routes
// ==========================================

const parchiRoutes = require('./routes/parchiRoutes');

// ==========================================
// Create Express App
// ==========================================

const app = express();

// ==========================================
// Connect MongoDB
// ==========================================

connectDB();

// ==========================================
// Port
// ==========================================

const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware
// ==========================================

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      'http://localhost:5173',
  }),
);

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

app.use(morgan('dev'));

// ==========================================
// Basic API Routes
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KrishiBandhu API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to KrishiBandhu API',
    version: '1.0.0',
  });
});

// ==========================================
// Authentication
// ==========================================

app.use(
  '/api/auth',
  authRoutes,
);

// ==========================================
// Farmer / Crop Routes
// ==========================================

app.use(
  '/api/crops',
  cropRoutes,
);

// ==========================================
// Weather
// ==========================================

app.use(
  '/api/weather',
  weatherRoutes,
);

// ==========================================
// Markets
// ==========================================

app.use(
  '/api/markets',
  marketRoutes,
);

// ==========================================
// Market Prices
// ==========================================

app.use(
  '/api/market-prices',
  marketPriceRoutes,
);

// ==========================================
// Bids
// ==========================================

app.use(
  '/api/bids',
  bidRoutes,
);

// ==========================================
// Transactions
// ==========================================

app.use(
  '/api/transactions',
  transactionRoutes,
);

// ==========================================
// AI Assistant
// ==========================================

app.use(
  '/api/ai',
  aiRoutes,
);

// ==========================================
// AI Image Analysis
// ==========================================

app.use(
  '/api/ai/image',
  aiImageRoutes,
);

// ==========================================
// Admin Dashboard
// ==========================================

app.use(
  '/api/admin',
  adminRoutes,
);

// ==========================================
// Admin User Management
// ==========================================

app.use(
  '/api/admin/users',
  adminUserRoutes,
);

// ==========================================
// Marketplace / Sale Listings
// ==========================================

app.use(
  '/api/sale-listings',
  saleListingRoutes,
);

// ==========================================
// Parchi
// ==========================================

app.use(
  '/api/parchi',
  parchiRoutes,
);

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// ==========================================
// Global Error Handler
// ==========================================

app.use(
  (error, req, res, next) => {
    console.error(
      'Unhandled Server Error:',
      error,
    );

    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  },
);

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
  console.log('');

  console.log('🌾 KrishiBandhu Backend');

  console.log('-------------------------');

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

  console.log('');
});