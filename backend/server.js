const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;

// -----------------------------
// Security
// -----------------------------

app.use(helmet());

// -----------------------------
// Middleware
// -----------------------------

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Logging
// -----------------------------

app.use(morgan('dev'));

// -----------------------------
// API Health Check
// -----------------------------

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KrishiBandhu API is running',
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------
// API Root
// -----------------------------

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to KrishiBandhu API',
    version: '1.0.0',
  });
});

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
  console.log('');
});