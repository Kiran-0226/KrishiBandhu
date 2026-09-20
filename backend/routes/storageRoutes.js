const express = require('express');

const {
  getStorageFacilities,
  getStorageFacilityById,
  createStorageFacility,
  updateStorageFacility,
  deleteStorageFacility,
} = require('../controllers/storageController');

const {
  createStorageRequest,
  getMyStorageRequests,
  getAllStorageRequests,
  getStorageRequestById,
  cancelStorageRequest,
  updateStorageRequestStatus,
} = require('../controllers/storageRequestController');

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
// Storage Requests
// ==========================================

// Farmer creates request
router.post(
  '/requests',
  requireRole('farmer'),
  createStorageRequest,
);

// Farmer gets own requests
router.get(
  '/requests/mine',
  requireRole('farmer'),
  getMyStorageRequests,
);

// Admin gets all requests
router.get(
  '/requests',
  requireRole('admin'),
  getAllStorageRequests,
);

// Get individual request
// Owner or admin authorization is handled
// inside the controller.
router.get(
  '/requests/:id',
  getStorageRequestById,
);

// Farmer cancels pending request
router.patch(
  '/requests/:id/cancel',
  requireRole('farmer'),
  cancelStorageRequest,
);

// Admin approves/rejects/completes
router.patch(
  '/requests/:id/status',
  requireRole('admin'),
  updateStorageRequestStatus,
);


// ==========================================
// Storage Facilities
// ==========================================

// Get all facilities
router.get(
  '/',
  getStorageFacilities,
);

// Admin creates facility
router.post(
  '/',
  requireRole('admin'),
  createStorageFacility,
);

// Get individual facility
router.get(
  '/:id',
  getStorageFacilityById,
);

// Admin updates facility
router.put(
  '/:id',
  requireRole('admin'),
  updateStorageFacility,
);

// Admin soft-deletes facility
router.delete(
  '/:id',
  requireRole('admin'),
  deleteStorageFacility,
);


module.exports = router;