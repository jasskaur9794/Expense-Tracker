import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  CircleEqual,
  User,
  Settings,
  LogOut,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, onClose, onQuickAction }) => {
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: ArrowUpRight },
    { name: 'Income', path: '/income', icon: ArrowDownLeft },
    { name: 'Budgets', path: '/budgets', icon: CircleEqual },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const activeStyle =
    'flex items-center space-x-3.5 px-4 py-3 rounded-2xl bg-primary-505 text-white font-bold shadow-md shadow-primary-505/15 dark:shadow-none transition-all';
  const inactiveStyle =
    'flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 font-semibold transition-all';

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Panel Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 lg:w-68 xl:w-72 bg-white dark:bg-slate-900 border-r border-slate-200/40 dark:border-slate-800/40 shadow-sm flex flex-col justify-between pb-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col space-y-6 flex-1">
          {/* Header section (aligned with Navbar) */}
          <div className="h-[68px] flex items-center space-x-3 px-6 border-b border-slate-200/40 dark:border-slate-800/40">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-505 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20 flex-shrink-0">
              E
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Expensify
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Actions Panel */}
          {onQuickAction && (
            <div className="px-4">
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 flex flex-col space-y-2">
                <span className="text-[10px] font-bold text-slate-400 pl-1 uppercase tracking-wider">
                  Quick Actions
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onQuickAction('add-expense');
                  }}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-700 dark:text-slate-300 p-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span>Add Expense</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onQuickAction('add-income');
                  }}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-700 dark:text-slate-300 p-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span>Add Income</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onQuickAction('set-budget');
                  }}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-700 dark:text-slate-300 p-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span>Set Budget</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Logout slot */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 px-4">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 font-bold transition-all outline-none"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
