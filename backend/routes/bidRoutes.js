const express = require('express');

const {
  getBids,
  getBidById,
  createBid,
  updateBidStatus,
  deleteBid,
} = require('../controllers/bidController');

const router = express.Router();

// Get all bids
router.get('/', getBids);

// Get a single bid
router.get('/:id', getBidById);

// Create a new bid
router.post('/', createBid);

// Update bid status
router.patch('/:id/status', updateBidStatus);

// Delete a bid
router.delete('/:id', deleteBid);

module.exports = router;