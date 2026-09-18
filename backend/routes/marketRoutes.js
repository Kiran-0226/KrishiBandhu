const express = require('express');

const {
  getMarkets,
  getMarketById,
  createMarket,
  deleteMarket,
} = require('../controllers/marketController');

const router = express.Router();

// =========================================
// Market routes
// =========================================

// Get all markets
// Supports:
// ?district=Nashik
// ?search=Lasalgaon
router.get('/', getMarkets);

// Get a single market
router.get('/:id', getMarketById);

// Submit a missing market
router.post('/', createMarket);

// Delete a user-submitted market
router.delete('/:id', deleteMarket);

module.exports = router;