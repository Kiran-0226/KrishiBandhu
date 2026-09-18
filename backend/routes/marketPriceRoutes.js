const express = require('express');

const {
  getMarketPrices,
  getMarketPriceById,
  createMarketPrice,
  deleteMarketPrice,
} = require('../controllers/marketPriceController');

const router = express.Router();

// =========================================
// Market Price Routes
// =========================================

// Get all market prices
//
// Examples:
// GET /api/market-prices
// GET /api/market-prices?commodity=Tomato
// GET /api/market-prices?district=Nashik
// GET /api/market-prices?date=2026-09-18
router.get('/', getMarketPrices);

// Get a single market price
router.get('/:id', getMarketPriceById);

// Create a market price
router.post('/', createMarketPrice);

// Delete a market price
router.delete('/:id', deleteMarketPrice);

module.exports = router;