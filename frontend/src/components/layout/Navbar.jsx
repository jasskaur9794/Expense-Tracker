import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBudgets } from '../../context/BudgetContext';
import ThemeToggle from '../common/ThemeToggle';
import { Bell, Menu, X, Check, Wallet, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../utils/api';

const Navbar = ({ onToggleSidebar }) => {
  const { user, formatCurrency } = useAuth();
  const { budgets } = useBudgets();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Compute live alerts based on user context data
  useEffect(() => {
    const alerts = [];

    // 1. Check Budgets
    if (budgets && budgets.length > 0) {
      budgets.forEach((b) => {
        if (b.spent > b.limit) {
          alerts.push({
            id: `budget-${b._id}`,
            type: 'danger',
            title: 'Budget Exceeded',
            message: `You spent ${formatCurrency(b.spent)} which exceeds your ${b.category} budget of ${formatCurrency(b.limit)}!`,
            time: 'Just now',
            read: false,
          });
        } else if (b.spent >= b.limit * 0.9) {
          alerts.push({
            id: `budget-warn-${b._id}`,
            type: 'warning',
            title: 'Budget Warning',
            message: `You have consumed 90%+ of your ${b.category} budget limit.`,
            time: 'Just now',
            read: false,
          });
        }
      });
    }

    // 2. Fetch total balance check for low-balance warning
    const checkBalance = async () => {
      try {
        const res = await API.get('/analytics/overview');
        if (res.data.success) {
          const balance = res.data.data.totalBalance;
          if (balance < 100 && balance > 0) {
            alerts.push({
              id: 'balance-low',
              type: 'warning',
              title: 'Low Balance Warning',
              message: `Your balance is currently low: ${formatCurrency(balance)}.`,
              time: 'Just now',
              read: false,
            });
          } else if (balance <= 0) {
            alerts.push({
              id: 'balance-neg',
              type: 'danger',
              title: 'Negative Balance Alert',
              message: `Your net account balance is in deficit: ${formatCurrency(balance)}.`,
              time: 'Just now',
              read: false,
            });
          }
        }
      } catch (err) {
        console.error('Balance alerts fetch failed:', err.message);
      } finally {
        // Map standard static notifications
        alerts.push({
          id: 'welcome',
          type: 'info',
          title: 'Welcome Back',
          message: `Explore analytics and set category-wise budgets for this month!`,
          time: 'Active',
          read: true,
        });

        setNotifications(alerts);
        setUnreadCount(alerts.filter(n => !n.read).length);
      }
    };

    if (user) {
      checkBalance();
    }
  }, [budgets, user]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map((name) => name[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/40 dark:border-slate-800/40 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-sm backdrop-blur-md">
      {/* Brand logo & mobile toggler */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Toggle Navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden flex items-center space-x-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-505 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
            E
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Expensify
          </span>
        </div>
      </div>

      {/* Actions and profile drop */}
      <div className="flex items-center space-x-3">
        {/* Notifications Alert Dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleToggleNotifications}
            className={`p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all duration-200`}
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse border border-white dark:border-slate-800">
                {unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Overlay backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                
                {/* Pop panel */}
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2 mb-3">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      Notifications ({notifications.length})
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary-505 hover:text-primary-600 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[320px] overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No active alerts or warnings
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border text-xs flex gap-2.5 transition-all ${
                            n.read
                              ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800/50 text-slate-500'
                              : 'bg-primary-50/30 dark:bg-primary-950/10 border-primary-100/50 dark:border-primary-900/20 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className={`mt-0.5 p-1 rounded-lg ${
                            n.type === 'danger'
                              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500'
                              : n.type === 'warning'
                              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'
                              : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500'
                          }`}>
                            {n.type === 'danger' || n.type === 'warning' ? (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            ) : (
                              <Wallet className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold flex items-center justify-between">
                              <span className="text-[12px]">{n.title}</span>
                              <span className="text-[9px] font-normal text-slate-400">{n.time}</span>
                            </div>
                            <p className="mt-0.5 leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggler */}
        <ThemeToggle />

        {/* Profile Avatar indicator */}
        {user && (
          <div className="flex items-center space-x-2.5 pl-1.5 border-l border-slate-200/50 dark:border-slate-700/50">
            {user.avatar ? (
              <img
                src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}${user.avatar}`}
                alt={user.name}
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-primary-505/20 border border-white dark:border-slate-800 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=22c55e&color=fff&bold=true`;
                }}
              />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-505 to-emerald-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary-505/20 shadow-sm">
                {getInitials(user.name)}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {user.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
