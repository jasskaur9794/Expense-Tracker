const { check, validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const budgetValidator = [
  check('category', 'Invalid budget category').isIn([
    'All',
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
  check('limit', 'Limit must be a non-negative number').isFloat({ min: 0 }),
  check('month', 'Month must be in YYYY-MM format').matches(/^\d{4}-\d{2}$/),
  validateResults,
];

module.exports = {
  budgetValidator,
};
