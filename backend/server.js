require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');

const cropRoutes = require('./routes/cropRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const marketRoutes = require('./routes/marketRoutes');
const marketPriceRoutes = require('./routes/marketPriceRoutes');
const bidRoutes = require('./routes/bidRoutes');

const app = express();

connectDB();

const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      'http://localhost:5173',
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(morgan('dev'));

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

app.use('/api/crops', cropRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/market-prices', marketPriceRoutes);
app.use('/api/bids', bidRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🌾 KrishiBandhu Backend');
  console.log('-------------------------');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Crops: http://localhost:${PORT}/api/crops`);
  console.log(
    `🌦️ Weather: http://localhost:${PORT}/api/weather?city=Bengaluru`,
  );
  console.log(`📈 Markets: http://localhost:${PORT}/api/markets`);
  console.log(
    `💰 Market Prices: http://localhost:${PORT}/api/market-prices`,
  );
  console.log(`🤝 Bids: http://localhost:${PORT}/api/bids`);
  console.log('');
});