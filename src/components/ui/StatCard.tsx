import { motion } from 'framer-motion';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
  label: string;
  value: string;
  description: string;
  increase: string;
  delay?: number;
}

export function StatCard({ label, value, description, increase, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="stat-card p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</div>
        <div className="flex items-center px-2 py-1 bg-green-50 rounded-full">
          <ArrowUpIcon className="w-3 h-3 text-green-500 mr-1" />
          <span className="text-xs font-medium text-green-600">{increase}</span>
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <div className="text-4xl font-bold gradient-text">{value}</div>
        <div className="text-sm text-gray-500 font-medium">improvement</div>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-tl-full" />
    </motion.div>
  );
}
