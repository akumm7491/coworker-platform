import { motion } from 'framer-motion';
import { animations } from '@/theme/constants';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <motion.div
      variants={animations.container}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-between mb-8"
    >
      <motion.div variants={animations.item} className="flex items-center space-x-4">
        {icon && (
          <motion.div
            whileHover={animations.rotate.hover}
            transition={animations.rotate.transition}
            className="p-3 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100"
          >
            {icon}
          </motion.div>
        )}
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            {title}
          </h1>
          {description && <p className="text-lg text-gray-600">{description}</p>}
        </div>
      </motion.div>

      {actions && <motion.div variants={animations.item}>{actions}</motion.div>}
    </motion.div>
  );
}
