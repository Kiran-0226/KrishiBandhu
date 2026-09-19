const express = require('express');

const {
  getAdminDashboardStats,
} = require('../controllers/adminController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/dashboard',
  protect,
  requireRole('admin'),
  getAdminDashboardStats,
);

module.exports = router;