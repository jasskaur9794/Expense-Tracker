const { check, validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const expenseValidator = [
  check('title', 'Expense title is required').notEmpty().trim(),
  check('amount', 'Amount must be a positive number').isFloat({ gt: 0 }),
  check('category', 'Invalid expense category').isIn([
    'Food',
    'Travel',
    'Shopping',
    'Entertainment',
    'Health',
    'Education',
    'Bills',
    'Rent',
    'Investment',
    'Others',
  ]),
  check('paymentMethod', 'Invalid payment method').optional().isIn([
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Mobile Payment',
    'Other',
  ]),
  check('date', 'Please select a valid date').optional().isISO8601(),
  validateResults,
];

const incomeValidator = [
  check('source', 'Income source title is required').notEmpty().trim(),
  check('amount', 'Amount must be a positive number').isFloat({ gt: 0 }),
  check('category', 'Invalid income category').isIn([
    'Salary',
    'Freelancing',
    'Business',
    'Investments',
    'Gifts',
    'Other',
  ]),
  check('date', 'Please select a valid date').optional().isISO8601(),
  validateResults,
];

module.exports = {
  expenseValidator,
  incomeValidator,
};
