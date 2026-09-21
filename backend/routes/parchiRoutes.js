const express = require('express');

const {
  createParchi,
  getParchis,
  getParchiById,
  getParchiTransport,
  updateParchiBankDetails,
  submitParchiTransfer,
  uploadParchiReceipt,
  confirmParchiPayment,
  updateParchiPaymentStatus,
} = require('../controllers/parchiController');

const {
  verifyParchiReceipt,
} = require('../controllers/parchiReceiptController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const {
  uploadParchiReceipt:
    uploadReceiptMiddleware,
} = require('../middleware/uploadMiddleware');

const router = express.Router();

/*
 * ==========================================
 * Authentication
 * ==========================================
 *
 * Every Parchi endpoint requires login.
 */

router.use(protect);

/*
 * ==========================================
 * Create Parchi
 * ==========================================
 *
 * Farmer only.
 *
 * POST
 * /api/parchi
 */

router.post(
  '/',
  requireRole('farmer'),
  createParchi,
);

/*
 * ==========================================
 * Get All Accessible Parchis
 * ==========================================
 *
 * Farmer → own Parchis
 * Trader → own Parchis
 * Admin → all Parchis
 *
 * GET
 * /api/parchi
 */

router.get(
  '/',
  getParchis,
);

/*
 * ==========================================
 * Get Parchi Transport Information
 * ==========================================
 *
 * Used by the Backhaul workflow to obtain
 * transport requirements from a Parchi.
 *
 * GET
 * /api/parchi/:id/transport
 */

router.get(
  '/:id/transport',
  getParchiTransport,
);

/*
 * ==========================================
 * Get Single Parchi
 * ==========================================
 *
 * GET
 * /api/parchi/:id
 */

router.get(
  '/:id',
  getParchiById,
);

/*
 * ==========================================
 * Farmer Bank Details
 * ==========================================
 *
 * Farmer provides the bank account / UPI
 * information where the trader should send
 * the payment.
 *
 * PATCH
 * /api/parchi/:id/bank-details
 */

router.patch(
  '/:id/bank-details',
  requireRole('farmer'),
  updateParchiBankDetails,
);

/*
 * ==========================================
 * Trader Transfer Submission
 * ==========================================
 *
 * Trader manually transfers the money
 * outside KrishiBandhu and records the
 * transfer reference here.
 *
 * PATCH
 * /api/parchi/:id/transfer
 */

router.patch(
  '/:id/transfer',
  requireRole('trader'),
  submitParchiTransfer,
);

/*
 * ==========================================
 * Trader Receipt Upload
 * ==========================================
 *
 * Trader uploads the bank/UPI transfer
 * receipt.
 *
 * POST
 * /api/parchi/:id/receipt
 *
 * multipart/form-data
 *
 * Field name:
 * receipt
 */

router.post(
  '/:id/receipt',
  requireRole('trader'),
  uploadReceiptMiddleware.single(
    'receipt',
  ),
  uploadParchiReceipt,
);

/*
 * ==========================================
 * AI Receipt Verification
 * ==========================================
 *
 * Trader or Admin can request AI analysis.
 *
 * POST
 * /api/parchi/:id/receipt/verify
 *
 * IMPORTANT:
 *
 * AI verification does NOT complete payment.
 *
 * Farmer confirmation is still required.
 */

router.post(
  '/:id/receipt/verify',
  requireRole(
    'trader',
    'admin',
  ),
  verifyParchiReceipt,
);

/*
 * ==========================================
 * Farmer Final Payment Confirmation
 * ==========================================
 *
 * Farmer confirms whether the payment has
 * actually been received.
 *
 * POST
 * /api/parchi/:id/confirm-payment
 *
 * IMPORTANT:
 *
 * This is the final step that can mark the
 * Parchi payment as successful.
 */

router.post(
  '/:id/confirm-payment',
  requireRole('farmer'),
  confirmParchiPayment,
);

/*
 * ==========================================
 * Legacy/Admin Payment Status
 * ==========================================
 *
 * TEMPORARY compatibility endpoint.
 *
 * We will remove/restrict this later when
 * the final farmer-confirmation workflow
 * is fully integrated.
 *
 * Do NOT use this endpoint to mark a real
 * payment as successful.
 */

router.patch(
  '/:id/payment',
  requireRole('admin'),
  updateParchiPaymentStatus,
);

module.exports = router;