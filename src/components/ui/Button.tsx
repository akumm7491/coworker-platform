import { motion, MotionProps } from 'framer-motion';
import { colors, animations } from '@/theme/constants';
import { ReactNode } from 'react';

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps>,
    MotionProps {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading,
  loadingText,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const colorConfig = colors[variant];
  const sizeClass = sizeClasses[size];

  return (
    <motion.button
      whileHover={animations.scale.hover}
      whileTap={animations.scale.tap}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center
        border border-transparent font-medium rounded-lg
        bg-gradient-to-r ${colorConfig.from} ${colorConfig.to}
        hover:${colorConfig.hover.from} hover:${colorConfig.hover.to}
        text-white shadow-lg hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${variant}-500
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClass}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
