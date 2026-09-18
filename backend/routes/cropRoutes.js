const express = require('express');

const {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
} = require('../controllers/cropController');

const router = express.Router();

// GET /api/crops
router.get('/', getCrops);

// GET /api/crops/:id
router.get('/:id', getCropById);

// POST /api/crops
router.post('/', createCrop);

// PUT /api/crops/:id
router.put('/:id', updateCrop);

// DELETE /api/crops/:id
router.delete('/:id', deleteCrop);

module.exports = router;