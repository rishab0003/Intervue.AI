import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-accent-soft text-accent border border-accent/20 hover:bg-accent/15';
      case 'ghost':
        return 'bg-transparent text-text-secondary hover:bg-black/5 hover:text-text-primary';
      case 'dark':
        return 'bg-text-primary text-white hover:bg-black';
      case 'primary':
      default:
        return 'bg-accent text-white shadow-md shadow-accent/20 hover:bg-accent/90';
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.05 }}
      whileTap={disabled || loading ? {} : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 450, damping: 15 }}
      className={`
        px-6 py-3 font-semibold rounded-full text-sm tracking-wide transition-colors outline-none cursor-pointer
        display-inline-flex items-center justify-center gap-2
        ${getStyles()} 
        ${fullWidth ? 'w-full flex justify-center' : ''} 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} 
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center gap-1">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </motion.button>
  );
};
export default Button;
