import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import {
  Globe,
  Sun,
  Moon,
  Coins,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Sparkles,
  Info,
  KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateProfile, request2FAToggle, confirm2FAToggle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [loading, setLoading] = useState(false);

  // 2FA Flow states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar (CA$)', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
  ];

  const handleCurrencyChange = async (e) => {
    const selected = e.target.value;
    setCurrency(selected);
    setLoading(true);
    try {
      const res = await updateProfile({ currency: selected });
      if (res && res.success) {
        toast.success(`Default currency updated to ${selected}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = async () => {
    toggleTheme();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    try {
      await updateProfile({ theme: newTheme });
    } catch (err) {
      console.error('Failed to sync theme to server:', err.message);
    }
  };

  const handle2FAToggleClick = async () => {
    setOtpError('');
    setOtp('');
    setOtpLoading(true);
    try {
      const res = await request2FAToggle();
      if (res && res.success) {
        setShow2FAModal(true);
      }
    } catch (err) {
      console.error('Error requesting 2FA toggle:', err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerify2FAToggle = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit code.');
      return;
    }

    setOtpLoading(true);
    try {
      const targetEnableState = !user?.twoFactorEnabled;
      const res = await confirm2FAToggle(otp, targetEnableState);
      if (res && res.success) {
        setShow2FAModal(false);
        setOtp('');
      }
    } catch (err) {
      console.error('Error confirming 2FA toggle:', err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      {/* 1. Header Section */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          Preferences & Settings
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
          Adjust visual styles, default currency localizations, and accounts security levels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Localization & Currencies */}
        <Card className="border border-slate-100 dark:border-slate-800/40 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Globe className="h-4.5 w-4.5 text-primary-505 shrink-0" /> Localizations & Currency
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Define the default currency symbol and conversion format applied to dashboard statistics, expenses ledger, and monthly budgets.
            </p>

            <div className="flex flex-col space-y-1.5 w-full mt-6">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-1">
                <Coins className="h-3.5 w-3.5" /> Base Currency
              </label>
              <select
                value={currency}
                onChange={handleCurrencyChange}
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 outline-none focus:border-primary-505 dark:focus:border-primary-505 transition-all text-sm disabled:opacity-50"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <Info className="h-4 w-4 text-primary-505 shrink-0 mt-0.5" />
            <p className="leading-normal">
              Changing this value immediately reformats all stored ledger entries and budget values into the selected currency. It does not perform active currency exchanges.
            </p>
          </div>
        </Card>

        {/* Display Styles & Visual Themes */}
        <Card className="border border-slate-100 dark:border-slate-800/40 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Sun className="h-4.5 w-4.5 text-primary-505 shrink-0" /> Appearance & Themes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Toggle between modern glassmorphic light styles or high-contrast dark theme mode optimized for reduced strain in low-light environments.
            </p>

            <div className="mt-8 flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="h-4.5 w-4.5 text-indigo-400" />
                ) : (
                  <Sun className="h-4.5 w-4.5 text-amber-500" />
                )}
                Active Theme: <span className="capitalize text-primary-505">{theme} Mode</span>
              </span>
              
              <Button
                variant="primary"
                onClick={handleThemeToggle}
                className="bg-primary-505 hover:bg-primary-600 text-xs py-2.5 px-4 rounded-xl font-bold"
              >
                Switch Theme
              </Button>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <Sparkles className="h-4 w-4 text-primary-505 shrink-0 mt-0.5" />
            <p className="leading-normal">
              Theme configurations are synced directly to your database profile, ensuring that your preferred setup automatically loads across all your logged devices.
            </p>
          </div>
        </Card>
      </div>

      {/* Two-Factor Authentication Security Card */}
      <Card className="border border-slate-100 dark:border-slate-800/40 bg-white dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-primary-505" /> Two-Factor Authentication (2FA)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              Add an extra layer of security to your financial data. When enabled, signing in will require a one-time secure verification code sent directly to your registered email.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              user?.twoFactorEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/50 dark:border-slate-700/50'
            }`}>
              {user?.twoFactorEnabled ? '2FA Active' : '2FA Inactive'}
            </span>

            <Button
              variant={user?.twoFactorEnabled ? 'secondary' : 'primary'}
              loading={otpLoading}
              onClick={handle2FAToggleClick}
              className={`text-xs py-2 px-4 rounded-xl font-bold ${
                user?.twoFactorEnabled
                  ? ''
                  : 'bg-primary-505 hover:bg-primary-600'
              }`}
            >
              {user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </div>
      </Card>

      {/* System Integrity & Guidelines */}
      <Card className="border border-slate-100 dark:border-slate-800/40 bg-white dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4.5 w-4.5 text-primary-505" /> System Integrity & Security Limits
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Our servers enforce industry-standard security constraints, including:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/25 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">JWT Tokens</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">Secure HTTPOnly cookie or authorization header caching, expiring after 30 days of inactivity.</p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/25 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Receipt Uploads</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">Secure Multer filters limiting attachment uploads exclusively to JPEG/PNG images below 3MB.</p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/25 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Budget Warnings</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">Proactive automatic checks triggering unread flags and toast popups when exceeding 90% category limits.</p>
          </div>
        </div>
      </Card>

      {/* 2FA Verification Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        title={user?.twoFactorEnabled ? 'Disable 2FA Verification' : 'Enable 2FA Verification'}
      >
        <div className="flex flex-col items-center text-center pb-4 select-none">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mb-4 shadow-sm">
            <KeyRound className="h-6 w-6" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We sent a secure 6-digit confirmation code to <span className="font-bold text-slate-800 dark:text-slate-100">{user?.email}</span>. Please enter it below to confirm this security change.
          </p>
        </div>

        <form onSubmit={handleVerify2FAToggle} className="space-y-4">
          <Input
            label="Security Code"
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
            loading={otpLoading}
            className="w-full py-3.5 mt-2 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/10 bg-primary-505 hover:bg-primary-600"
          >
            Verify & Update 2FA
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
