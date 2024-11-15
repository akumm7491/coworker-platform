import { Agent } from '@/types';
import { motion } from 'framer-motion';
import {
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BeakerIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

interface AgentCardProps {
  agent: Agent;
  onAssignTask: (agentId: string) => void;
}

const agentTypeIcons = {
  director: RocketLaunchIcon,
  architect: BeakerIcon,
  developer: CommandLineIcon,
  qa: CpuChipIcon,
  devops: CpuChipIcon,
  analytics: ChartBarIcon
};

function AgentCard({ agent, onAssignTask }: AgentCardProps) {
  const statusConfig = {
    idle: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: 'text-gray-500',
      border: 'border-gray-200',
      glow: 'shadow-gray-500/20'
    },
    working: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: 'text-green-500',
      border: 'border-green-200',
      glow: 'shadow-green-500/20'
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: 'text-red-500',
      border: 'border-red-200',
      glow: 'shadow-red-500/20'
    }
  };

  const colors = statusConfig[agent.status];
  const AgentTypeIcon = agentTypeIcons[agent.type] || CpuChipIcon;

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
              {agent.name}
            </motion.h3>
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <BoltIcon className={`h-4 w-4 mr-1.5 ${colors.icon}`} />
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </motion.span>
          </div>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="p-2 rounded-full bg-indigo-50"
          >
            <AgentTypeIcon className="h-6 w-6 text-indigo-600" />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BeakerIcon className="h-5 w-5 text-indigo-500" />
            <span>Type: {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}</span>
          </div>
          
          {agent.currentTask && (
            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm text-indigo-700">
                <ClockIcon className="h-5 w-5 text-indigo-500" />
                <span>Current Task: {agent.currentTask.title}</span>
              </div>
            </div>
          )}
        </motion.div>
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Performance Metrics</h4>
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50"
            >
              <CheckCircleIcon className="h-5 w-5 text-indigo-500 mr-2" />
              <div>
                <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Tasks</p>
                <p className="text-lg font-semibold text-indigo-900">{agent.performance.tasksCompleted}</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50"
            >
              <ChartBarIcon className="h-5 w-5 text-emerald-500 mr-2" />
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Success</p>
                <p className="text-lg font-semibold text-emerald-900">{agent.performance.successRate}%</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center p-3 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50"
            >
              <ClockIcon className="h-5 w-5 text-rose-500 mr-2" />
              <div>
                <p className="text-xs font-medium text-rose-600 uppercase tracking-wide">Avg</p>
                <p className="text-lg font-semibold text-rose-900">{agent.performance.averageTime}s</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAssignTask(agent.id)}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Assign Task
          <ArrowRightIcon className="ml-2 h-5 w-5 animate-pulse" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default AgentCard;
