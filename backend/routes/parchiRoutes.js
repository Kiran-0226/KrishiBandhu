const express = require('express');

const {
  createParchi,
  getParchis,
  getParchiById,
  updateParchiPaymentStatus,
} = require('../controllers/parchiController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const router = express.Router();

/*
 * Every Parchi operation requires authentication.
 */
router.use(protect);

/*
 * Get Parchis
 *
 * Farmer → their own Parchis
 * Trader → their own Parchis
 * Admin  → all Parchis
 */
router.get(
  '/',
  getParchis,
);

/*
 * Generate Parchi
 *
 * Only the farmer who owns the accepted bid's
 * crop, or an admin, can generate it.
 */
router.post(
  '/',
  requireRole('farmer', 'admin'),
  createParchi,
);

/*
 * Get one Parchi
 *
 * Ownership is additionally checked
 * inside the controller.
 */
router.get(
  '/:id',
  getParchiById,
);

/*
 * Update payment status
 *
 * For now this is restricted to Admin.
 * Later, the real payment verification/webhook
 * flow will update this automatically.
 */
router.patch(
  '/:id/payment',
  requireRole('admin'),
  updateParchiPaymentStatus,
);

module.exports = router;