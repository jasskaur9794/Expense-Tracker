import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  error = '',
  icon: Icon,
  className = '',
  rows, // If provided, renders textarea instead of input
  ...props
}) => {
  const inputStyle = `w-full rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 border ${
    error
      ? 'border-rose-500 focus:ring-rose-200'
      : 'border-slate-200 dark:border-slate-800/80 focus:border-primary-500 focus:ring-primary-200 dark:focus:ring-primary-950/30'
  } outline-none focus:ring-4 transition-all duration-200 px-4 ${Icon ? 'pl-11' : 'pl-4'} py-3 text-sm`;

  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-1 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        {rows ? (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            rows={rows}
            className={`${inputStyle} resize-none`}
            {...props}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className={inputStyle}
            {...props}
          />
        )}
      </div>
      {error && <span className="text-xs text-rose-500 pl-1 font-medium">{error}</span>}
    </div>
  );
};

export default Input;
