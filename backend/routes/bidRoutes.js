const express = require('express');

const {
  getBids,
  getBidById,
  createBid,
  updateBidStatus,
  deleteBid,
} = require('../controllers/bidController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const router = express.Router();

/*
 * Every bid request requires authentication.
 */
router.use(protect);

/*
 * Get bids
 *
 * Farmer  → bids for their crops
 * Trader  → their own bids
 * Admin   → all bids
 */
router.get('/', getBids);

/*
 * Get a single bid
 */
router.get('/:id', getBidById);

/*
 * Create bid
 *
 * Only authenticated traders can place bids.
 */
router.post(
  '/',
  requireRole('trader'),
  createBid,
);

/*
 * Update bid status
 *
 * Farmers can accept/reject bids on their
 * own crops.
 *
 * Admins can manage any bid.
 */
router.patch(
  '/:id/status',
  requireRole('farmer', 'admin'),
  updateBidStatus,
);

/*
 * Delete bid
 *
 * Trader can delete their own bid.
 * Admin can delete any bid.
 *
 * Ownership is enforced inside the controller.
 */
router.delete(
  '/:id',
  requireRole('trader', 'admin'),
  deleteBid,
);

module.exports = router;