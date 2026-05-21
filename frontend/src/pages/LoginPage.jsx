import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Mail, Lock, Eye, EyeOff, Sparkles, KeyRound, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, verifyRegistrationOtp, verify2FAOtp, resendRegistrationOtp, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Security Verification Screens state
  const [requireVerification, setRequireVerification] = useState(false);
  const [require2FA, setRequire2FA] = useState(false);
  const [securityEmail, setSecurityEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resending, setResending] = useState(false);

  // Parse redirect route parameter
  const from = location.state?.from?.pathname || '/dashboard';

  // Check if redirected due to expired token session
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setIsSessionExpired(true);
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await login(formData.email, formData.password, formData.rememberMe);
    if (res && res.success) {
      if (res.requireVerification) {
        setSecurityEmail(res.email);
        setRequireVerification(true);
      } else if (res.require2FA) {
        setSecurityEmail(res.email);
        setRequire2FA(true);
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otp.trim() || otp.length !== 6) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }

    let res;
    if (requireVerification) {
      res = await verifyRegistrationOtp(securityEmail, otp);
    } else if (require2FA) {
      res = await verify2FAOtp(securityEmail, otp);
    }

    if (res && res.success) {
      navigate(from, { replace: true });
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    await resendRegistrationOtp(securityEmail);
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-mesh dark:bg-slate-950/20 flex flex-col items-center justify-center p-6 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md flex flex-col items-center space-y-6"
      >
        {/* Brand logo header */}
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-505 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
            E
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Expensify
          </span>
        </Link>

        {/* Floating warning alert if token expired */}
        {isSessionExpired && !requireVerification && !require2FA && (
          <div className="w-full p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-xs text-center font-semibold leading-relaxed">
            Your secure session has expired. Please login again.
          </div>
        )}

        <AnimatePresence mode="wait">
          {!requireVerification && !require2FA ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Card glass className="w-full p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
                    Access Your Account
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Verify credentials to unlock your financial tracking dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      label="Secure Password"
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
                      onClick={handleTogglePassword}
                      className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>

                  {/* Remember Me / Forgot links row */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 font-semibold text-slate-500 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="rounded border-slate-300 dark:border-slate-800 text-primary-505 focus:ring-primary-505 h-4 w-4"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.success('Password recovery email link simulated successfully!')}
                      className="font-bold text-primary-505 hover:text-primary-600 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full py-3.5 mt-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary-500/10"
                  >
                    Sign In
                  </Button>
                </form>
              </Card>

              {/* Redirect toggle footer */}
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-semibold mt-6">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary-505 hover:text-primary-600 transition-colors font-bold"
                >
                  Create one free
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="security-verification"
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
                    {require2FA ? <ShieldAlert className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white">
                    {require2FA ? '2FA Code Required' : 'Verify Your Email'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                    We sent a 6-digit secure code to <span className="font-bold text-slate-700 dark:text-slate-200">{securityEmail}</span>. Enter it below to proceed.
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
                    Verify & Authenticate
                  </Button>
                </form>

                <div className="flex flex-col items-center space-y-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  {!require2FA && (
                    <>
                      <span className="text-slate-400 font-medium">Didn't receive the email?</span>
                      <button
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="font-bold text-primary-505 hover:text-primary-600 transition-colors disabled:opacity-50"
                      >
                        {resending ? 'Sending Code...' : 'Resend Verification Code'}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setRequireVerification(false);
                      setRequire2FA(false);
                      setOtp('');
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-semibold"
                  >
                    ← Back to Sign In
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

export default LoginPage;
