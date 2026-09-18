const Transaction = require('../models/Transaction');
const Crop = require('../models/Crop');
const Market = require('../models/Market');

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('crop')
      .populate('market')
      .sort({ transactionDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Get transactions error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions.',
    });
  }
};

// Get a single transaction
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('crop')
      .populate('market');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Get transaction error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction.',
    });
  }
};

// Create a transaction
const createTransaction = async (req, res) => {
  try {
    const {
      type,
      category,
      description,
      amount,
      crop,
      market,
      transactionDate,
    } = req.body;

    if (
      !type ||
      !category ||
      amount === undefined ||
      amount === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'Type, category and amount are required.',
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be income or expense.',
      });
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0.',
      });
    }

    if (crop) {
      const cropExists = await Crop.findById(crop);

      if (!cropExists) {
        return res.status(404).json({
          success: false,
          message: 'Crop not found.',
        });
      }
    }

    if (market) {
      const marketExists = await Market.findById(market);

      if (!marketExists) {
        return res.status(404).json({
          success: false,
          message: 'Market not found.',
        });
      }
    }

    const transaction = await Transaction.create({
      type,
      category: category.trim(),
      description: description ? description.trim() : '',
      amount: parsedAmount,
      crop: crop || null,
      market: market || null,
      transactionDate: transactionDate
        ? new Date(transactionDate)
        : new Date(),
    });

    const populatedTransaction =
      await Transaction.findById(transaction._id)
        .populate('crop')
        .populate('market');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: populatedTransaction,
    });
  } catch (error) {
    console.error('Create transaction error:', error);

    res.status(400).json({
      success: false,
      message:
        error.message || 'Failed to create transaction.',
    });
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    const {
      type,
      category,
      description,
      amount,
      crop,
      market,
      transactionDate,
    } = req.body;

    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be income or expense.',
        });
      }

      transaction.type = type;
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be empty.',
        });
      }

      transaction.category = category.trim();
    }

    if (description !== undefined) {
      transaction.description = description
        ? description.trim()
        : '';
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);

      if (
        !Number.isFinite(parsedAmount) ||
        parsedAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0.',
        });
      }

      transaction.amount = parsedAmount;
    }

    if (crop !== undefined) {
      if (crop) {
        const cropExists = await Crop.findById(crop);

        if (!cropExists) {
          return res.status(404).json({
            success: false,
            message: 'Crop not found.',
          });
        }
      }

      transaction.crop = crop || null;
    }

    if (market !== undefined) {
      if (market) {
        const marketExists = await Market.findById(market);

        if (!marketExists) {
          return res.status(404).json({
            success: false,
            message: 'Market not found.',
          });
        }
      }

      transaction.market = market || null;
    }

    if (transactionDate !== undefined) {
      const parsedDate = new Date(transactionDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction date.',
        });
      }

      transaction.transactionDate = parsedDate;
    }

    await transaction.save();

    const updatedTransaction =
      await Transaction.findById(transaction._id)
        .populate('crop')
        .populate('market');

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Update transaction error:', error);

    res.status(400).json({
      success: false,
      message:
        error.message || 'Failed to update transaction.',
    });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    console.error('Delete transaction error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction.',
    });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};