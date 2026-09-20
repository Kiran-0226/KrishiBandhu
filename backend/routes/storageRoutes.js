const express = require('express');

const {
  getStorageFacilities,
  getStorageFacilityById,
  createStorageFacility,
  updateStorageFacility,
  deleteStorageFacility,
} = require('../controllers/storageController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const router = express.Router();

/*
 * ==========================================
 * Public / Authenticated Storage Access
 * ==========================================
 */

router.get(
  '/',
  protect,
  getStorageFacilities,
);

router.get(
  '/:id',
  protect,
  getStorageFacilityById,
);


/*
 * ==========================================
 * Admin Storage Management
 * ==========================================
 */

router.post(
  '/',
  protect,
  requireRole('admin'),
  createStorageFacility,
);

router.put(
  '/:id',
  protect,
  requireRole('admin'),
  updateStorageFacility,
);

router.delete(
  '/:id',
  protect,
  requireRole('admin'),
  deleteStorageFacility,
);


module.exports = router;