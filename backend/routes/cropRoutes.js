const express = require('express');

const {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
} = require('../controllers/cropController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const router = express.Router();

// ==========================================
// Authentication
// ==========================================

router.use(protect);


// ==========================================
// Crop Routes
// ==========================================

// GET /api/crops
// Farmer → own crops
// Admin  → all crops
router.get(
  '/',
  getCrops,
);


// GET /api/crops/:id
// Farmer → own crop
// Admin  → any crop
router.get(
  '/:id',
  getCropById,
);


// POST /api/crops
// Farmer only
router.post(
  '/',
  requireRole('farmer'),
  createCrop,
);


// PUT /api/crops/:id
// Farmer → own crop
// Admin  → any crop
router.put(
  '/:id',
  requireRole('farmer', 'admin'),
  updateCrop,
);


// DELETE /api/crops/:id
// Farmer → own crop
// Admin  → any crop
router.delete(
  '/:id',
  requireRole('farmer', 'admin'),
  deleteCrop,
);


module.exports = router;