import { Project } from '@/types';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BoltIcon,
  BeakerIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (projectId: string) => void;
}

function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: 'text-green-500',
          border: 'border-green-200',
          glow: 'shadow-green-500/20'
        };
      case 'paused':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: 'text-yellow-500',
          border: 'border-yellow-200',
          glow: 'shadow-yellow-500/20'
        };
      case 'completed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: 'text-blue-500',
          border: 'border-blue-200',
          glow: 'shadow-blue-500/20'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: 'text-gray-500',
          border: 'border-gray-200',
          glow: 'shadow-gray-500/20'
        };
    }
  };

  const colors = getStatusColor(project.status);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 ${colors.glow}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold text-gray-900 mb-2"
            >
              {project.name}
            </motion.h3>
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <BoltIcon className={`h-4 w-4 mr-1.5 ${colors.icon}`} />
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </motion.span>
          </div>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="p-2 rounded-full bg-indigo-50"
          >
            <CpuChipIcon className="h-6 w-6 text-indigo-600" />
          </motion.div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 text-sm mb-6 line-clamp-2"
        >
          {project.description}
        </motion.p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50"
          >
            <UserGroupIcon className="h-6 w-6 text-indigo-500 mr-3" />
            <div>
              <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Agents</p>
              <p className="text-lg font-semibold text-indigo-900">{project.agents.length}</p>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center p-3 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50"
          >
            <CheckCircleIcon className="h-6 w-6 text-violet-500 mr-3" />
            <div>
              <p className="text-xs font-medium text-violet-600 uppercase tracking-wide">Tasks</p>
              <p className="text-lg font-semibold text-violet-900">{project.tasks.length}</p>
            </div>
          </motion.div>
        </div>
        
        <div className="border-t border-gray-100 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50"
            >
              <ChartBarIcon className="h-6 w-6 text-emerald-500 mr-3" />
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Completion</p>
                <p className="text-lg font-semibold text-emerald-900">{project.metrics.completionRate}%</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center p-3 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50"
            >
              <ClockIcon className="h-6 w-6 text-rose-500 mr-3" />
              <div>
                <p className="text-xs font-medium text-rose-600 uppercase tracking-wide">Success</p>
                <p className="text-lg font-semibold text-rose-900">{project.metrics.taskSuccessRate}%</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewDetails(project.id)}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          View Details
          <ArrowRightIcon className="ml-2 h-5 w-5 animate-pulse" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ProjectCard;
