import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import {
  User,
  Mail,
  Lock,
  Trash2,
  Camera,
  AlertTriangle,
  UploadCloud,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile, uploadAvatar, changePassword, deleteAccount, requestPasswordOtp } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Password Change Secure Verification flow states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  const handleRequestOtp = async () => {
    setOtpSending(true);
    const res = await requestPasswordOtp();
    setOtpSending(false);
    if (res && res.success) {
      setOtpSent(true);
    }
  };

  const fileInputRef = useRef(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email) {
      toast.error('Name and Email fields are required');
      return;
    }

    setProfileLoading(true);
    const res = await updateProfile(profileData);
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmNewPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit security code sent to your email');
      return;
    }

    setPasswordLoading(true);
    const res = await changePassword(oldPassword, newPassword, otpCode);
    setPasswordLoading(false);

    if (res && res.success) {
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setOtpCode('');
      setOtpSent(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 3MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error('File size exceeds the 3MB limit');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setAvatarLoading(true);
    await uploadAvatar(file);
    setAvatarLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type the exact phrase to confirm account deletion.');
      return;
    }

    if (window.confirm('This is permanent. All your financial logs, budgets, and files will be deleted forever. Do you wish to continue?')) {
      await deleteAccount();
    }
  };

  const currentAvatarUrl = user?.avatar
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${user.avatar}`
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=22c55e`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Area */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          Personal Profile
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Manage your account credentials, security levels, and display settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center justify-center text-center p-6 border border-slate-100 dark:border-slate-850">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md relative bg-slate-100 flex items-center justify-center">
                {avatarLoading ? (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                  </div>
                ) : (
                  <img
                    src={currentAvatarUrl}
                    alt="User Profile Display"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              
              {/* Overlay edit badge */}
              <div className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-505 hover:bg-primary-600 text-white shadow transition-all duration-200">
                <Camera className="h-4 w-4" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="mt-4">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                {user?.name}
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Active Member
              </span>
            </div>

            <div className="w-full border-t border-slate-50 dark:border-slate-800/60 mt-5 pt-4 text-xs text-left text-slate-500 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Currency:</span>
                <span className="font-bold text-emerald-500 uppercase">{user?.currency || 'USD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Joined:</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Editing panels */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <Card className="border border-slate-100 dark:border-slate-850">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 pb-1 border-b border-slate-50 dark:border-slate-800/30">
              Account Details
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  icon={User}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  icon={Mail}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" loading={profileLoading} className="w-36 bg-primary-505">
                  Update Details
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password Panel */}
          <Card className="border border-slate-100 dark:border-slate-850">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 pb-1 border-b border-slate-50 dark:border-slate-800/30">
              Security & Credentials
            </h2>
            
            {!otpSent ? (
              <div className="space-y-4 py-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  To protect your account and verify your identity, changing your password requires confirming a secure 6-digit One-Time Password (OTP) sent directly to your registered email address (<span className="font-bold text-slate-700 dark:text-slate-200">{user?.email}</span>).
                </p>
                <div className="flex justify-start">
                  <Button
                    type="button"
                    variant="primary"
                    loading={otpSending}
                    onClick={handleRequestOtp}
                    className="w-48 bg-primary-505 text-xs py-2.5 rounded-xl font-bold"
                  >
                    Request Security Code
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold leading-relaxed">
                  ✓ A secure 6-digit security code has been sent to your email. Please enter it below to authorize this password update.
                </div>

                <Input
                  label="Current Password"
                  name="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  icon={Lock}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    icon={Lock}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    name="confirmNewPassword"
                    type="password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    icon={Lock}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="sm:col-span-2">
                    <Input
                      label="Security Code (OTP)"
                      name="otpCode"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      icon={Lock}
                      className="tracking-widest font-bold text-center"
                    />
                  </div>
                  <div className="pb-0.5">
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={otpSending}
                      className="w-full py-3 text-xs font-bold text-primary-505 hover:text-primary-600 transition-colors border border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-505 rounded-2xl flex items-center justify-center h-[46px] disabled:opacity-50 cursor-pointer"
                    >
                      {otpSending ? 'Resending...' : 'Resend Code'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="w-28 text-xs py-2.5 rounded-xl font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={passwordLoading}
                    className="w-40 bg-primary-505 rounded-xl font-bold text-xs py-2.5"
                  >
                    Confirm Changes
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-100 dark:border-red-950/20 bg-red-50/10 dark:bg-red-950/5">
            <h2 className="text-sm font-bold text-red-500 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" /> Danger Zone
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Permanently delete this account and all accumulated financial records, category budgets, receipts, and income charts. This action is absolute and cannot be undone.
            </p>

            <div className="mt-4 pt-2">
              {!showDeleteConfirm ? (
                <Button
                  variant="primary"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 hover:bg-red-650 rounded-xl"
                  icon={Trash2}
                >
                  Delete My Account
                </Button>
              ) : (
                <div className="space-y-4 max-w-md pt-2">
                  <div className="flex flex-col space-y-1.5 w-full">
                    <label className="text-[10px] font-bold text-red-500 pl-1 uppercase tracking-wider">
                      Please type "DELETE MY ACCOUNT" to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type phrase here..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border border-red-200 dark:border-red-950/50 outline-none text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-xs py-2 px-4 rounded-xl"
                      disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
                    >
                      Permanently Delete
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      className="text-xs py-2 px-4 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
