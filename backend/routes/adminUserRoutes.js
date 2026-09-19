const express = require('express');

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserVerification,
  updateUserRole,
} = require('../controllers/adminUserController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All Admin User routes require Admin access
|--------------------------------------------------------------------------
*/

router.use(
  protect,
  requireRole('admin'),
);

/*
|--------------------------------------------------------------------------
| Get Users
|--------------------------------------------------------------------------
*/

router.get(
  '/',
  getAllUsers,
);

/*
|--------------------------------------------------------------------------
| Get Single User
|--------------------------------------------------------------------------
*/

router.get(
  '/:id',
  getUserById,
);

/*
|--------------------------------------------------------------------------
| Activate / Deactivate
|--------------------------------------------------------------------------
*/

router.patch(
  '/:id/status',
  updateUserStatus,
);

/*
|--------------------------------------------------------------------------
| Verify / Unverify
|--------------------------------------------------------------------------
*/

router.patch(
  '/:id/verification',
  updateUserVerification,
);

/*
|--------------------------------------------------------------------------
| Change Farmer / Trader Role
|--------------------------------------------------------------------------
*/

router.patch(
  '/:id/role',
  updateUserRole,
);

module.exports = router;