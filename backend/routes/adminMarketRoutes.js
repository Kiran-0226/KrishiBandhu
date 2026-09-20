const express = require('express');

const {
  getAdminMarkets,
  getAdminMarketStats,
  getAdminMarketById,
  updateMarketVerification,
  deleteAdminMarket,
} = require('../controllers/adminMarketController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All Admin Market routes require Admin access
|--------------------------------------------------------------------------
*/

router.use(
  protect,
  requireRole('admin'),
);

/*
|--------------------------------------------------------------------------
| Market Statistics
|--------------------------------------------------------------------------
*/

router.get(
  '/stats',
  getAdminMarketStats,
);

/*
|--------------------------------------------------------------------------
| Get All Markets
|--------------------------------------------------------------------------
|
| Supports:
| ?search=Lasalgaon
| ?district=Nashik
| ?status=pending
| ?status=verified
| ?status=rejected
| ?source=MSAMB
| ?source=user_submitted
|
|--------------------------------------------------------------------------
*/

router.get(
  '/',
  getAdminMarkets,
);

/*
|--------------------------------------------------------------------------
| Get Single Market
|--------------------------------------------------------------------------
*/

router.get(
  '/:id',
  getAdminMarketById,
);

/*
|--------------------------------------------------------------------------
| Verify / Reject User-Submitted Market
|--------------------------------------------------------------------------
*/

router.patch(
  '/:id/verification',
  updateMarketVerification,
);

/*
|--------------------------------------------------------------------------
| Delete User-Submitted Market
|--------------------------------------------------------------------------
*/

router.delete(
  '/:id',
  deleteAdminMarket,
);

module.exports = router;