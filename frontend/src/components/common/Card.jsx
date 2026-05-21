import React from 'react';

const Card = ({ children, className = '', hoverEffect = false, glass = false }) => {
  const baseClasses = glass
    ? 'glass rounded-3xl p-6 shadow-glass dark:shadow-glass-dark border border-white/20 dark:border-slate-800/40 backdrop-blur-md'
    : 'bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/40';

  const hoverClasses = hoverEffect
    ? 'hover:-translate-y-1 hover:shadow-md dark:hover:shadow-indigo-950/20 transition-all duration-300'
    : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
