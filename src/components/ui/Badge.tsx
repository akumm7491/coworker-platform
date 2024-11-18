import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { status as statusStyles } from '@/theme/constants';
import { BoltIcon } from '@heroicons/react/24/outline';

interface BadgeProps {
  status: 'analysis' | 'idle' | 'working' | 'error' | 'active' | 'paused' | 'completed';
  animate?: boolean;
  children?: ReactNode;
  showIcon?: boolean;
}

export function Badge({ status, animate = true, children, showIcon = true }: BadgeProps) {
  const style = statusStyles[status];

  const pulseAnimation =
    animate && (status === 'working' || status === 'active')
      ? {
          scale: [1, 1.05, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }
      : {};

  return (
    <motion.span
      className={`
        inline-flex items-center px-3 py-1 
        rounded-full text-sm font-medium
        ${style.bg} ${style.text} ${style.border}
      `}
      animate={pulseAnimation}
    >
      {showIcon && <BoltIcon className={`h-4 w-4 mr-1.5 ${style.icon}`} />}
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </motion.span>
  );
}
