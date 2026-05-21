import React from 'react';

const Loader = ({ size = 'medium', color = 'primary' }) => {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-10 w-10 border-3',
    large: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    primary: 'border-primary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    indigo: 'border-indigo-500 border-t-transparent',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-solid ${sizeClasses[size] || sizeClasses.medium} ${
          colorClasses[color] || colorClasses.primary
        }`}
      />
    </div>
  );
};

export default Loader;
