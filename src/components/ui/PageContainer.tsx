import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { animations } from '@/theme/constants';

interface PageContainerProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

const gradients = {
  primary: 'from-indigo-50 via-white to-purple-50',
  success: 'from-emerald-50 via-white to-teal-50',
  warning: 'from-amber-50 via-white to-orange-50',
  error: 'from-rose-50 via-white to-pink-50',
  neutral: 'from-gray-50 via-white to-slate-50',
};

export function PageContainer({ children, variant = 'primary' }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen bg-gradient-to-br ${gradients[variant]} p-8`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={animations.container}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
