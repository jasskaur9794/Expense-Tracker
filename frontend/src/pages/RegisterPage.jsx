import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { User, Mail, Lock, Eye, EyeOff, ShieldAlert, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage = () => {
  const { register, verifyRegistrationOtp, resendRegistrationOtp, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP Verification States
  const [requireVerification, setRequireVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resending, setResending] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!strongPasswordRegex.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Confirm password must match password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await register(formData.name, formData.email, formData.password, formData.confirmPassword);
    if (res && res.success && res.requireVerification) {
      setVerificationEmail(res.email);
      setRequireVerification(true);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otp.trim() || otp.length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    const res = await verifyRegistrationOtp(verificationEmail, otp);
    if (res && res.success) {
      navigate('/dashboard');
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    await resendRegistrationOtp(verificationEmail);
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-mesh dark:bg-slate-950/20 flex flex-col items-center justify-center p-6 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md flex flex-col items-center space-y-6 py-8"
      >
        {/* Logo header */}
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-505 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
            E
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Expensify
          </span>
        </Link>

        <AnimatePresence mode="wait">
          {!requireVerification ? (
            <motion.div
              key="register-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Card glass className="w-full p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
                    Create Your Account
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Start tracking your income, expenses, and monthly budget limits
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    icon={User}
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    icon={Mail}
                  />

                  <div className="relative">
                    <Input
                      label="Create Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      required
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      required
                      icon={Lock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full py-3.5 mt-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary-500/10"
                  >
                    Get Started Free
                  </Button>
                </form>
              </Card>

              {/* Redirect toggle footer */}
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-semibold mt-6">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-505 hover:text-primary-600 transition-colors font-bold"
                >
                  Sign in here
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp-verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Card glass className="w-full p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl" />
                
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mb-4 shadow-sm">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
                    Confirm Registration
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                    We sent a 6-digit secure code to <span className="font-bold text-slate-700 dark:text-slate-200">{verificationEmail}</span>. Enter it below to activate your Expensify account.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <Input
                    label="Verification Code"
                    name="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    error={otpError}
                    required
                    className="text-center tracking-widest text-lg font-bold"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full py-3.5 mt-2 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/10"
                  >
                    Verify & Create Account
                  </Button>
                </form>

                <div className="flex flex-col items-center space-y-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-slate-400 font-medium">
                    Didn't receive the email?
                  </span>
                  <button
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="font-bold text-primary-505 hover:text-primary-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {resending ? 'Sending Code...' : 'Resend Verification Code'}
                  </button>
                  
                  <button
                    onClick={() => setRequireVerification(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-semibold"
                  >
                    ← Back to Registration
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
