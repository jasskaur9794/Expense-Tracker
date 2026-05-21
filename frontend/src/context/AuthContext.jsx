import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check login status on app boot
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        const res = await API.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Session boot check failed:', err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };
    checkLoggedIn();
  }, []);

  // Register User
  const register = async (name, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password, confirmPassword });
      if (res.data.success) {
        if (res.data.requireVerification) {
          toast.success(res.data.message || 'OTP verification sent to your email!');
          return { success: true, requireVerification: true, email: res.data.email };
        }
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Registration successful! Welcome aboard!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Verify Registration OTP
  const verifyRegistrationOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-registration', { email, otp });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Email verified successfully! Welcome to Expensify!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Resend Registration OTP
  const resendRegistrationOtp = async (email) => {
    try {
      const res = await API.post('/auth/resend-registration-otp', { email });
      if (res.data.success) {
        toast.success(res.data.message || 'Verification code resent successfully.');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Login User
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password, rememberMe });
      if (res.data.success) {
        if (res.data.require2FA) {
          toast.success(res.data.message || '2FA secure code sent to your email.');
          return { success: true, require2FA: true, email: res.data.email };
        }
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return { success: true };
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requireVerification) {
        toast.success(err.response.data.message || 'Verification code sent!');
        return { success: true, requireVerification: true, email: err.response.data.email };
      }
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Login failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Verify Login 2FA OTP
  const verify2FAOtp = async (email, otp) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-2fa', { email, otp });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || '2FA verification failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Request 2FA Toggle
  const request2FAToggle = async () => {
    try {
      const res = await API.post('/auth/2fa/request-toggle');
      if (res.data.success) {
        toast.success(res.data.message || 'OTP sent successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to initiate 2FA toggle';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Confirm 2FA Toggle
  const confirm2FAToggle = async (otp, enable) => {
    try {
      const res = await API.post('/auth/2fa/confirm-toggle', { otp, enable });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success(res.data.message || '2FA status updated successfully!');
        return { success: true, twoFactorEnabled: res.data.twoFactorEnabled };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification of security code failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Logout User
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('API logout error:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      window.location.href = '/';
    }
  };

  // Update Profile Info
  const updateProfile = async (updates) => {
    try {
      const res = await API.put('/auth/profile', updates);
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Upload Profile Avatar
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await API.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Avatar uploaded successfully!');
        return { success: true, avatar: res.data.avatar };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Avatar upload failed';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Request Password Change OTP
  const requestPasswordOtp = async () => {
    try {
      const res = await API.post('/auth/password/request-otp');
      if (res.data.success) {
        toast.success(res.data.message || 'OTP sent successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send security code';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Change Password
  const changePassword = async (oldPassword, newPassword, otp) => {
    try {
      const res = await API.put('/auth/password', { oldPassword, newPassword, otp });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update password';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Delete Account
  const deleteAccount = async () => {
    try {
      const res = await API.delete('/auth/account');
      if (res.data.success) {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Account and associated data deleted.');
        window.location.href = '/';
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Currency Formatter Helper
  const formatCurrency = (amount) => {
    const symbolMap = {
      USD: '$',
      EUR: '€',
      INR: '₹',
      GBP: '£',
      CAD: 'CA$',
      AUD: 'A$',
    };
    const symbol = symbolMap[user?.currency || 'USD'] || '$';
    return `${symbol}${parseFloat(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecked,
        register,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        login,
        verify2FAOtp,
        request2FAToggle,
        confirm2FAToggle,
        logout,
        updateProfile,
        uploadAvatar,
        requestPasswordOtp,
        changePassword,
        deleteAccount,
        formatCurrency,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
