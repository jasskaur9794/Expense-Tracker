const Income = require('../models/Income');

// @desc    Get all incomes with advanced filtering, sorting, and pagination
// @route   GET /api/income
// @access  Private
exports.getIncomes = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Build Query Filters
    const queryObj = { userId };

    // Search by source title
    if (req.query.search) {
      queryObj.source = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by Category
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    // Filter by Date range
    if (req.query.startDate || req.query.endDate) {
      queryObj.date = {};
      if (req.query.startDate) {
        queryObj.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        queryObj.date.$lte = new Date(req.query.endDate);
      }
    }

    // Filter by specific Month/Year (expects YYYY-MM)
    if (req.query.month) {
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

    const total = await Income.countDocuments(queryObj);
    const incomes = await Income.find(queryObj)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: incomes.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
      incomes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add single income
// @route   POST /api/income
// @access  Private
exports.addIncome = async (req, res, next) => {
  try {
    const { source, amount, category, date, notes } = req.body;

    const income = await Income.create({
      userId: req.user._id,
      source,
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : undefined,
      notes,
    });

    res.status(201).json({
      success: true,
      income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single income
// @route   PUT /api/income/:id
// @access  Private
exports.editIncome = async (req, res, next) => {
  try {
    let income = await Income.findOne({ _id: req.params.id, userId: req.user._id });

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    // Merge changes
    const updates = {
      source: req.body.source || income.source,
      amount: req.body.amount ? parseFloat(req.body.amount) : income.amount,
      category: req.body.category || income.category,
      date: req.body.date ? new Date(req.body.date) : income.date,
      notes: req.body.notes !== undefined ? req.body.notes : income.notes,
    };

    income = await Income.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single income
// @route   DELETE /api/income/:id
// @access  Private
exports.deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    await income.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Income record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
