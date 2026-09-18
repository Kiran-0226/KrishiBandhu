const express = require('express');

const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

const router = express.Router();

// Get all transactions
router.get('/', getTransactions);

// Get a single transaction
router.get('/:id', getTransactionById);

// Create a transaction
router.post('/', createTransaction);

// Update a transaction
router.put('/:id', updateTransaction);

// Delete a transaction
router.delete('/:id', deleteTransaction);

module.exports = router;