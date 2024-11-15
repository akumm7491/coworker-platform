import { motion } from 'framer-motion';
import { animations } from '@/theme/constants';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  blur?: boolean;
  gradient?: boolean;
}

export const Card = ({
  children,
  className = '',
  hover = false,
  blur = false,
  gradient = false
}: CardProps) => {
  return (
    <motion.div
      whileHover={hover ? animations.lift.hover : undefined}
      className={`
        rounded-xl shadow-lg
        ${hover ? 'hover:shadow-xl transition-all duration-300' : ''}
        ${blur ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'}
        ${gradient ? 'bg-gradient-to-br from-gray-50 to-white' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
