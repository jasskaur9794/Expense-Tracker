const { check, validationResult } = require('express-validator');

// Middlware to parse validation results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const registerValidator = [
  check('name', 'Name is required').notEmpty().trim(),
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check(
    'password',
    'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/),
  check('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Confirm password must match password');
    }
    return true;
  }),
  validateResults,
];

const loginValidator = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').notEmpty(),
  validateResults,
];

const updateProfileValidator = [
  check('name', 'Name cannot be empty').optional().notEmpty().trim(),
  check('currency', 'Invalid currency choice').optional().isIn(['USD', 'EUR', 'INR', 'GBP', 'CAD', 'AUD']),
  check('theme', 'Invalid theme selection').optional().isIn(['light', 'dark']),
  validateResults,
];

const changePasswordValidator = [
  check('oldPassword', 'Old password is required').notEmpty(),
  check(
    'newPassword',
    'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/),
  check('otp', 'OTP verification code is required').notEmpty(),
  validateResults,
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
};
