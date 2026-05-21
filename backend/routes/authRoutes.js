const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  registerUser,
  verifyRegistration,
  resendRegistrationOtp,
  loginUser,
  verify2FA,
  request2FAToggle,
  confirm2FAToggle,
  logoutUser,
  getMe,
  updateProfile,
  uploadAvatar,
  requestPasswordOtp,
  changePassword,
  deleteAccount,
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require('../validators/authValidator');

router.post('/register', registerValidator, registerUser);
router.post('/verify-registration', verifyRegistration);
router.post('/resend-registration-otp', resendRegistrationOtp);
router.post('/login', loginValidator, loginUser);
router.post('/verify-2fa', verify2FA);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidator, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/2fa/request-toggle', protect, request2FAToggle);
router.post('/2fa/confirm-toggle', protect, confirm2FAToggle);
router.post('/password/request-otp', protect, requestPasswordOtp);
router.put('/password', protect, changePasswordValidator, changePassword);
router.delete('/account', protect, deleteAccount);
router.post('/logout', logoutUser);

module.exports = router;
