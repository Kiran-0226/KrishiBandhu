const express = require('express');

const {
  getAdminCrops,
  getAdminCropStats,
  getAdminCropById,
  deleteAdminCrop,
} = require('../controllers/adminCropController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const router = express.Router();


// ==========================================
// Admin Authentication
// ==========================================

router.use(
  protect,
  requireRole('admin'),
);


// ==========================================
// Crop Statistics
// ==========================================

router.get(
  '/stats',
  getAdminCropStats,
);


// ==========================================
// All Crops
// ==========================================

router.get(
  '/',
  getAdminCrops,
);


// ==========================================
// Single Crop
// ==========================================

router.get(
  '/:id',
  getAdminCropById,
);


// ==========================================
// Delete Crop
// ==========================================

router.delete(
  '/:id',
  deleteAdminCrop,
);


module.exports = router;