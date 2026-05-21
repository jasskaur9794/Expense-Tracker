const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const generateToken = require('../utils/generateToken');
const { sendOtpEmail } = require('../utils/sendEmail');
const fs = require('fs');
const path = require('path');

// Helper to set cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        theme: user.theme,
        twoFactorEnabled: user.twoFactorEnabled,
        isVerified: user.isVerified,
      },
    });
};

// @desc    Register a new user (with OTP email verification)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user (isVerified will be false initially)
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      otp,
      otpExpire,
    });

    // Log the OTP instantly for easy bypass in Render logs
    console.log(`\n==================================================`);
    console.log(`[RENDER FREE TIER SMTP BYPASS - INSTANT]`);
    console.log(`Since Render Free Tier blocks outgoing SMTP ports (587),`);
    console.log(`you can copy your OTP directly from here:`);
    console.log(`OTP Code for ${user.email} is: ${otp}`);
    console.log(`==================================================\n`);

    // Send OTP verification email in background (non-blocking)
    sendOtpEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: 'Create Your Expensify Account',
    }).then(() => {
      console.log(`[OTP Sent] Email sent successfully with code ${otp} to ${user.email}`);
    }).catch((mailError) => {
      console.error('Registration OTP email sending failed:', mailError.message);
    });

    res.status(201).json({
      success: true,
      requireVerification: true,
      email: user.email,
      message: 'Registration successful! A 6-digit verification code was sent to your email address.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify registration OTP
// @route   POST /api/auth/verify-registration
// @access  Public
exports.verifyRegistration = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified. Please sign in.' });
    }

    // Verify OTP
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpire) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Set verified, clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Resend registration OTP
// @route   POST /api/auth/resend-registration-otp
// @access  Public
exports.resendRegistrationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified. Please sign in.' });
    }

    // Generate fresh OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Log the OTP instantly for easy bypass in Render logs
    console.log(`\n==================================================`);
    console.log(`[RENDER FREE TIER SMTP BYPASS - INSTANT]`);
    console.log(`Since Render Free Tier blocks outgoing SMTP ports (587),`);
    console.log(`you can copy your OTP directly from here:`);
    console.log(`OTP Code for ${user.email} is: ${otp}`);
    console.log(`==================================================\n`);

    // Send OTP verification email in background (non-blocking)
    sendOtpEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: 'Create Your Expensify Account (Resend)',
    }).then(() => {
      console.log(`[OTP Sent] Email sent successfully with code ${otp} to ${user.email}`);
    }).catch((mailError) => {
      console.error('Resend OTP email sending failed:', mailError.message);
    });

    res.status(200).json({
      success: true,
      message: 'A fresh verification code was sent to your email address.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify account email check first
    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Log the OTP instantly for easy bypass in Render logs
      console.log(`\n==================================================`);
      console.log(`[RENDER FREE TIER SMTP BYPASS - INSTANT]`);
      console.log(`Since Render Free Tier blocks outgoing SMTP ports (587),`);
      console.log(`you can copy your OTP directly from here:`);
      console.log(`OTP Code for ${user.email} is: ${otp}`);
      console.log(`==================================================\n`);

      // Send OTP verification email in background (non-blocking)
      sendOtpEmail({
        email: user.email,
        name: user.name,
        otp,
        purpose: 'Verify Your Expensify Account',
      }).then(() => {
        console.log(`[OTP Sent] Email sent successfully with code ${otp} to ${user.email}`);
      }).catch((err) => {
        console.error('Resending verification email failed:', err.message);
      });

      return res.status(403).json({
        success: false,
        requireVerification: true,
        email: user.email,
        message: 'Your account is not verified yet. A verification code has been sent to your email.',
      });
    }

    // If 2FA is active, generate OTP and return require2FA
    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Log the OTP instantly for easy bypass in Render logs
      console.log(`\n==================================================`);
      console.log(`[RENDER FREE TIER SMTP BYPASS - INSTANT]`);
      console.log(`Since Render Free Tier blocks outgoing SMTP ports (587),`);
      console.log(`you can copy your OTP directly from here:`);
      console.log(`OTP Code for ${user.email} is: ${otp}`);
      console.log(`==================================================\n`);

      // Send OTP verification email in background (non-blocking)
      sendOtpEmail({
        email: user.email,
        name: user.name,
        otp,
        purpose: 'Secure 2FA Account Access',
      }).then(() => {
        console.log(`[OTP Sent] Email sent successfully with code ${otp} to ${user.email}`);
      }).catch((err) => {
        console.error('2FA login email failed:', err.message);
      });

      return res.status(200).json({
        success: true,
        require2FA: true,
        email: user.email,
        message: 'Two-Factor Authentication is active. A secure 6-digit verification code was sent to your email.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA login OTP
// @route   POST /api/auth/verify-2fa
// @access  Public
exports.verify2FA = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is not enabled for this account' });
    }

    // Check OTP
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpire) {
      return res.status(400).json({ success: false, message: 'Invalid or expired 2FA verification code' });
    }

    // Clear OTP details
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Request to enable or disable 2FA (generates and emails OTP)
// @route   POST /api/auth/2fa/request-toggle
// @access  Private
exports.request2FAToggle = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const action = user.twoFactorEnabled ? 'Disable' : 'Enable';

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.tempOtp = otp;
    user.tempOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Log the OTP instantly for easy bypass in Render logs
    console.log(`\n==================================================`);
    console.log(`[RENDER FREE TIER SMTP BYPASS - INSTANT]`);
    console.log(`Since Render Free Tier blocks outgoing SMTP ports (587),`);
    console.log(`you can copy your OTP directly from here:`);
    console.log(`OTP Code for ${user.email} is: ${otp}`);
    console.log(`==================================================\n`);

    // Send OTP verification email in background (non-blocking)
    sendOtpEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: `${action} Two-Factor Authentication`,
    }).then(() => {
      console.log(`[OTP Sent] Email sent successfully with code ${otp} to ${user.email}`);
    }).catch((mailError) => {
      console.error('2FA Request OTP email sending failed:', mailError.message);
    });

    res.status(200).json({
      success: true,
      message: `A security code has been sent to your email to confirm ${action.toLowerCase()} 2FA.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm 2FA toggle using OTP
// @route   POST /api/auth/2fa/confirm-toggle
// @access  Private
exports.confirm2FAToggle = async (req, res, next) => {
  try {
    const { otp, enable } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.tempOtp || user.tempOtp !== otp || new Date() > user.tempOtpExpire) {
      return res.status(400).json({ success: false, message: 'Invalid or expired security code' });
    }

    user.twoFactorEnabled = !!enable;
    user.tempOtp = null;
    user.tempOtpExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
      message: `Two-Factor Authentication has been successfully ${user.twoFactorEnabled ? 'enabled' : 'disabled'}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        theme: user.theme,
        twoFactorEnabled: user.twoFactorEnabled,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        currency: req.user.currency,
        theme: req.user.theme,
        twoFactorEnabled: req.user.twoFactorEnabled,
        isVerified: req.user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name || req.user.name,
      currency: req.body.currency || req.user.currency,
      theme: req.body.theme || req.user.theme,
    };

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        theme: user.theme,
        twoFactorEnabled: user.twoFactorEnabled,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile avatar
// @route   POST /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    // Delete old avatar file if it exists
    if (req.user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', req.user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
        } catch (err) {
          console.error('Error deleting old avatar:', err.message);
        }
      }
    }

    // Update avatar string in database (save relative URL path)
    const relativeAvatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: relativeAvatarPath },
      { new: true }
    );

    res.status(200).json({
      success: true,
      avatar: relativeAvatarPath,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        theme: user.theme,
        twoFactorEnabled: user.twoFactorEnabled,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request Password Change OTP
// @route   POST /api/auth/password/request-otp
// @access  Private
exports.requestPasswordOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.tempOtp = otp;
    user.tempOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Log the OTP instantly for easy bypass in Render logs
    console.log(`\n==================================================`);
    console.log(`[RENDER FREE TIER SMTP BYPASS - INSTANT]`);
    console.log(`Since Render Free Tier blocks outgoing SMTP ports (587),`);
    console.log(`you can copy your OTP directly from here:`);
    console.log(`OTP Code for ${user.email} is: ${otp}`);
    console.log(`==================================================\n`);

    // Send OTP verification email in background (non-blocking)
    sendOtpEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: 'Change Account Password',
    }).then(() => {
      console.log(`[OTP Sent] Email sent successfully with code ${otp} to ${user.email}`);
    }).catch((mailError) => {
      console.error('Password Request OTP email sending failed:', mailError.message);
    });

    res.status(200).json({
      success: true,
      message: 'A security code has been sent to your email to confirm password update.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change account password (requires old password, new password, and OTP verification)
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, otp } = req.body;

    const user = await User.findById(req.user._id);

    // Verify temp OTP
    if (!user.tempOtp || user.tempOtp !== otp || new Date() > user.tempOtpExpire) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password security code' });
    }

    // Verify old password matches
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Pre-save pre hook will encrypt this password
    user.password = newPassword;
    user.tempOtp = null;
    user.tempOtpExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and all affiliated documents (Expenses, Income, Budgets)
// @route   DELETE /api/auth/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Prune user avatar files and receipts first
    if (req.user.avatar) {
      const avatarPath = path.join(__dirname, '..', req.user.avatar);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }

    // Find and delete expense receipts
    const expenses = await Expense.find({ userId });
    for (const exp of expenses) {
      if (exp.receipt) {
        const receiptPath = path.join(__dirname, '..', exp.receipt);
        if (fs.existsSync(receiptPath)) {
          try {
            fs.unlinkSync(receiptPath);
          } catch (err) {
            console.error('Error unlinking receipt:', err.message);
          }
        }
      }
    }

    // Delete database records
    await Expense.deleteMany({ userId });
    await Income.deleteMany({ userId });
    await Budget.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    // Clear response cookies
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Account and associated financial data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
