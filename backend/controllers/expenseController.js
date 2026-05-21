const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Helper to recalculate budget spent for a category in a specific month
const syncBudgetSpent = async (userId, category, dateObj) => {
  try {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}-${month}`;

    const startDate = new Date(`${monthStr}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 1. Update the specific category budget (e.g., Food, Travel)
    const categoryExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category: category,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const catSpent = categoryExpenses.length > 0 ? categoryExpenses[0].totalSpent : 0;

    await Budget.findOneAndUpdate(
      { userId, category, month: monthStr },
      { spent: catSpent },
      { new: true }
    );

    // 2. Update the global "All" budget (if one exists)
    const allExpenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpent = allExpenses.length > 0 ? allExpenses[0].totalSpent : 0;

    await Budget.findOneAndUpdate(
      { userId, category: 'All', month: monthStr },
      { spent: totalSpent },
      { new: true }
    );
  } catch (err) {
    console.error('Error syncing budget spent:', err.message);
  }
};

exports.syncBudgetSpent = syncBudgetSpent;

// @desc    Get all expenses with advanced filtering, sorting, and pagination
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Build Query Filters
    const queryObj = { userId };

    // Search by title
    if (req.query.search) {
      queryObj.title = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by Category
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    // Filter by Payment Method
    if (req.query.paymentMethod) {
      queryObj.paymentMethod = req.query.paymentMethod;
    }

    // Filter by Date range (startDate & endDate)
    if (req.query.startDate || req.query.endDate) {
      queryObj.date = {};
      if (req.query.startDate) {
        queryObj.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        queryObj.date.$lte = new Date(req.query.endDate);
      }
    }

    // Filter by specific Month/Year
    if (req.query.month) {
      // Expects YYYY-MM
      const start = new Date(`${req.query.month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      queryObj.date = { $gte: start, $lt: end };
    }

    // Filter by Amount range
    if (req.query.minAmount || req.query.maxAmount) {
      queryObj.amount = {};
      if (req.query.minAmount) {
        queryObj.amount.$gte = parseFloat(req.query.minAmount);
      }
      if (req.query.maxAmount) {
        queryObj.amount.$lte = parseFloat(req.query.maxAmount);
      }
    }

    // Filter by Tags (expects comma-separated list)
    if (req.query.tags) {
      const tagList = req.query.tags.split(',').map(tag => tag.trim());
      queryObj.tags = { $all: tagList };
    }

    // 2. Sorting
    let sortBy = { date: -1 }; // default newest first
    if (req.query.sort) {
      const parts = req.query.sort.split(':');
      const sortField = parts[0];
      const sortOrder = parts[1] === 'asc' ? 1 : -1;
      sortBy = { [sortField]: sortOrder };
    }

    // 3. Pagination Setup
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Expense.countDocuments(queryObj);
    const expenses = await Expense.find(queryObj)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: expenses.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add single expense
// @route   POST /api/expenses
// @access  Private
exports.addExpense = async (req, res, next) => {
  try {
    const { title, amount, category, description, paymentMethod, date, tags } = req.body;

    let receiptPath = '';
    if (req.file) {
      receiptPath = `/uploads/receipts/${req.file.filename}`;
    }

    // Create Expense document
    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount: parseFloat(amount),
      category,
      description,
      paymentMethod,
      date: date ? new Date(date) : undefined,
      receipt: receiptPath,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    });

    // Sync budget
    await syncBudgetSpent(req.user._id, expense.category, expense.date);

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.editExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    // Store old values for budget syncing
    const oldCategory = expense.category;
    const oldDate = expense.date;

    // Handle receipt update
    let receiptPath = expense.receipt;
    if (req.file) {
      // Delete old receipt file
      if (expense.receipt) {
        const oldFile = path.join(__dirname, '..', expense.receipt);
        if (fs.existsSync(oldFile)) {
          try {
            fs.unlinkSync(oldFile);
          } catch (err) {
            console.error('Error removing old receipt file:', err.message);
          }
        }
      }
      receiptPath = `/uploads/receipts/${req.file.filename}`;
    }

    // Merge updates
    const updates = {
      title: req.body.title || expense.title,
      amount: req.body.amount ? parseFloat(req.body.amount) : expense.amount,
      category: req.body.category || expense.category,
      description: req.body.description !== undefined ? req.body.description : expense.description,
      paymentMethod: req.body.paymentMethod || expense.paymentMethod,
      date: req.body.date ? new Date(req.body.date) : expense.date,
      receipt: receiptPath,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim())) : expense.tags,
    };

    expense = await Expense.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    // Sync budget of old category/date and new category/date
    await syncBudgetSpent(req.user._id, oldCategory, oldDate);
    if (oldCategory !== expense.category || oldDate.getTime() !== expense.date.getTime()) {
      await syncBudgetSpent(req.user._id, expense.category, expense.date);
    }

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    // Delete receipt file from local disk if it exists
    if (expense.receipt) {
      const fileToRemove = path.join(__dirname, '..', expense.receipt);
      if (fs.existsSync(fileToRemove)) {
        try {
          fs.unlinkSync(fileToRemove);
        } catch (err) {
          console.error('Error removing receipt:', err.message);
        }
      }
    }

    const { category, date } = expense;

    // Delete record from DB
    await expense.deleteOne();

    // Recalculate and update the corresponding budget limits
    await syncBudgetSpent(req.user._id, category, date);

    res.status(200).json({
      success: true,
      message: 'Expense removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
