import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { animations } from '@/theme/constants';
import { Card } from './Card';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <Card
      blur
      className="p-12 text-center"
    >
      <motion.div
        variants={animations.container}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={animations.item}
          className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6"
        >
          <Icon className="h-12 w-12 text-indigo-600" />
        </motion.div>
        <motion.h3 
          variants={animations.item}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {title}
        </motion.h3>
        <motion.p 
          variants={animations.item}
          className="text-gray-600 mb-8 max-w-md mx-auto"
        >
          {description}
        </motion.p>
        {action && (
          <motion.div variants={animations.item}>
            {action}
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
}
