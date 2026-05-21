import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-colors duration-200"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5 text-amber-500 fill-amber-100" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-400 fill-indigo-950" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
