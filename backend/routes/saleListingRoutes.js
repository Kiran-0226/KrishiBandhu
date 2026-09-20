const express = require('express');

const {
  getSaleListings,
  getSaleListingById,
  createSaleListing,
  updateSaleListing,
  deleteSaleListing,
} = require('../controllers/saleListingController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Every sale-listing request requires authentication.
router.use(protect);

// GET /api/sale-listings
// Farmer  → own listings
// Trader  → active listings
// Admin   → all listings
router.get('/', getSaleListings);

// GET /api/sale-listings/:id
router.get('/:id', getSaleListingById);

// POST /api/sale-listings
// Only farmers can list crops for sale.
router.post(
  '/',
  requireRole('farmer'),
  createSaleListing,
);

// PUT /api/sale-listings/:id
// Farmers can update their own listings.
// Admins can manage listings.
router.put(
  '/:id',
  requireRole('farmer', 'admin'),
  updateSaleListing,
);

// DELETE /api/sale-listings/:id
// Farmers can delete their own listings.
// Admins can delete listings.
router.delete(
  '/:id',
  requireRole('farmer', 'admin'),
  deleteSaleListing,
);

module.exports = router;