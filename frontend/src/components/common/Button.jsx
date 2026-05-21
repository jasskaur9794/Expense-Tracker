import React from 'react';
import { motion } from 'framer-motion';
import Loader from './Loader';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-primary-505 hover:bg-primary-600 active:bg-primary-700 text-white focus:ring-primary-400 shadow-lg shadow-primary-505/10 dark:shadow-none',
    secondary:
      'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 focus:ring-slate-400 border border-slate-200/50 dark:border-slate-700/50',
    danger:
      'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white focus:ring-rose-400 shadow-lg shadow-rose-500/10 dark:shadow-none',
    glass:
      'glass hover:bg-white/40 active:bg-white/60 dark:hover:bg-slate-800/40 dark:active:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-white/30 dark:border-slate-700/30',
  };

  const sizes = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-5 py-2.5 text-sm',
    large: 'px-7 py-3 text-base',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.medium
      } ${className}`}
    >
      {loading ? (
        <Loader size="small" color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />
      ) : (
        <>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
