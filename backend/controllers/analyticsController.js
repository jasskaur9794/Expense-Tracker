const Expense = require('../models/Expense');
const Income = require('../models/Income');
const mongoose = require('mongoose');

// @desc    Get dashboard financial overview stats (totals, savings, recent transactions, quick insights)
// @route   GET /api/analytics/overview
// @access  Private
exports.getOverview = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Calculate Total Income
    const incomeStats = await Income.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalIncome = incomeStats.length > 0 ? incomeStats[0].total : 0;

    // 2. Calculate Total Expenses
    const expenseStats = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpenses = expenseStats.length > 0 ? expenseStats[0].total : 0;

    // 3. Balance & Savings calculations
    const totalBalance = totalIncome - totalExpenses;
    const savings = totalBalance > 0 ? totalBalance : 0;
    const savingsRatio = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // 4. Get Highest Spending Category
    const highestSpendingCategory = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]);
    const topCategory = highestSpendingCategory.length > 0
      ? { name: highestSpendingCategory[0]._id, amount: highestSpendingCategory[0].total }
      : { name: 'None', amount: 0 };

    // 5. Fetch Recent Unified Transactions (Income + Expenses combined)
    // We fetch recent expenses and recent incomes separately, then mix and sort them in JS for simplicity & speed.
    const recentExpenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(10)
      .lean();
    
    const recentIncomes = await Income.find({ userId })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const unifiedTransactions = [
      ...recentExpenses.map(exp => ({ ...exp, type: 'Expense' })),
      ...recentIncomes.map(inc => ({ ...inc, type: 'Income', title: inc.source })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // 6. Current Month vs Previous Month Spending Comparison
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: currentMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const prevMonthExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: previousMonthStart, $lte: previousMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const currentMonthSpend = currentMonthExpenses.length > 0 ? currentMonthExpenses[0].total : 0;
    const prevMonthSpend = prevMonthExpenses.length > 0 ? prevMonthExpenses[0].total : 0;

    let monthlyComparisonPercent = 0;
    if (prevMonthSpend > 0) {
      monthlyComparisonPercent = Math.round(((currentMonthSpend - prevMonthSpend) / prevMonthSpend) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        totalBalance,
        savings,
        savingsRatio,
        topCategory,
        currentMonthSpend,
        prevMonthSpend,
        monthlyComparisonPercent,
        recentTransactions: unifiedTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly income vs expense analytics (past 6 months)
// @route   GET /api/analytics/monthly
// @access  Private
exports.getMonthlyAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Get date threshold (6 months ago from start of current month)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Aggregate monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Aggregate monthly incomes
    const monthlyIncomes = await Income.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Map aggregates to a structured output for charts
    const monthlyMap = {};

    // Generate list of past 6 months to guarantee continuous chart indexes (no empty slots)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-indexed
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      monthlyMap[monthKey] = {
        month: monthKey,
        label,
        expenses: 0,
        income: 0,
        savings: 0,
      };
    }

    // Populate expense figures
    monthlyExpenses.forEach(item => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (monthlyMap[monthKey]) {
        monthlyMap[monthKey].expenses = item.total;
      }
    });

    // Populate income figures
    monthlyIncomes.forEach(item => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (monthlyMap[monthKey]) {
        monthlyMap[monthKey].income = item.total;
      }
    });

    // Compute savings per month
    const chartData = Object.values(monthlyMap).map(m => {
      const savingsVal = m.income - m.expenses;
      return {
        ...m,
        savings: savingsVal > 0 ? savingsVal : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise expense breakdown for pie/doughnut charts
// @route   GET /api/analytics/categories
// @access  Private
exports.getCategoryAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { month } = req.query; // optional month filter e.g. YYYY-MM

    const matchQuery = { userId };

    if (month) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      matchQuery.date = { $gte: start, $lt: end };
    }

    // Group expenses by category
    const categoryStats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
        },
      },
      { $sort: { value: -1 } },
    ]);

    // Total expense of this category set for ratio calculations
    const totalExpensesSum = categoryStats.reduce((sum, item) => sum + item.value, 0);

    const formattedData = categoryStats.map(item => ({
      name: item._id,
      value: item.value,
      percentage: totalExpensesSum > 0 ? Math.round((item.value / totalExpensesSum) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      total: totalExpensesSum,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};
