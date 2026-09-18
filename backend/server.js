require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const cropRoutes = require('./routes/cropRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Port
const PORT = process.env.PORT || 5000;

// -----------------------------
// Middleware
// -----------------------------

// Security headers
app.use(helmet());

// Enable CORS for frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);

// Parse JSON requests
app.use(express.json());

// Parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan('dev'));

// -----------------------------
// Basic API Routes
// -----------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KrishiBandhu API is running',
    timestamp: new Date().toISOString(),
  });
});

// API welcome route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to KrishiBandhu API',
    version: '1.0.0',
  });
});

// -----------------------------
// Application Routes
// -----------------------------

// Crop API
app.use('/api/crops', cropRoutes);

// -----------------------------
// 404 Handler
// -----------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// -----------------------------
// Start Server
// -----------------------------

app.listen(PORT, () => {
  console.log('');
  console.log('🌾 KrishiBandhu Backend');
  console.log('-------------------------');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Crops: http://localhost:${PORT}/api/crops`);
  console.log('');
});