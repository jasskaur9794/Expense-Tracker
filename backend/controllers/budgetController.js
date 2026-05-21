const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// Helper to calculate total spent in a month for a category
const calculateCategorySpent = async (userId, category, monthStr) => {
  const startDate = new Date(`${monthStr}-01T00:00:00.000Z`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const matchCondition = {
    userId: new mongoose.Types.ObjectId(userId),
    date: { $gte: startDate, $lt: endDate },
  };

  // If budget category is category-specific, filter by it. Otherwise, get total overall.
  if (category !== 'All') {
    matchCondition.category = category;
  }

  const result = await Expense.aggregate([
    { $match: matchCondition },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// @desc    Get user budgets for a specific month (YYYY-MM)
// @route   GET /api/budget
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Default to current month in YYYY-MM format
    const month = req.query.month || new Date().toISOString().substring(0, 7);

    // Retrieve budgets for this month
    const budgets = await Budget.find({ userId, month });

    res.status(200).json({
      success: true,
      month,
      count: budgets.length,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update a budget limit
// @route   POST /api/budget
// @access  Private
exports.setBudget = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category, limit, month } = req.body;

    // Calculate current spent for this category/month before saving
    const currentSpent = await calculateCategorySpent(userId, category, month);

    // Check if budget exists, if so update limit and spent, otherwise create new
    let budget = await Budget.findOne({ userId, category, month });

    if (budget) {
      budget.limit = parseFloat(limit);
      budget.spent = currentSpent;
      await budget.save();
    } else {
      budget = await Budget.create({
        userId,
        category,
        limit: parseFloat(limit),
        spent: currentSpent,
        month,
      });
    }

    res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budget/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget record not found' });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
