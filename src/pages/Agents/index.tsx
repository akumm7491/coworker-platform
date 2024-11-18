import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import AgentCard from '@/components/agents/AgentCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  PlusIcon,
  BeakerIcon,
  FunnelIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  CpuChipIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const agentTypes = [
  { value: 'all', label: 'All Types', icon: UserGroupIcon },
  { value: 'director', label: 'Director', icon: RocketLaunchIcon },
  { value: 'architect', label: 'Architect', icon: BeakerIcon },
  { value: 'developer', label: 'Developer', icon: CommandLineIcon },
  { value: 'qa', label: 'QA', icon: CpuChipIcon },
  { value: 'devops', label: 'DevOps', icon: CpuChipIcon },
  { value: 'analytics', label: 'Analytics', icon: ChartBarIcon },
];

function Agents() {
  const { agents } = useSelector((state: RootState) => state.agents);
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredAgents =
    selectedType === 'all' ? agents : agents.filter(agent => agent.type === selectedType);

  const handleAssignTask = (agentId: string) => {
    // Implement task assignment logic
    console.log('Assign task to agent:', agentId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                Agents
              </h1>
              <p className="text-lg text-gray-600">Manage your autonomous agents</p>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="appearance-none bg-white/80 backdrop-blur-sm rounded-xl pl-12 pr-10 py-3 shadow-lg border border-gray-200 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {agentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <FunnelIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-600" />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Agent
              </motion.button>
            </div>
          </motion.div>

          {/* Agents Grid */}
          <AnimatePresence mode="wait">
            {filteredAgents.length === 0 ? (
              <motion.div
                key="empty"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center"
              >
                <motion.div
                  variants={itemVariants}
                  className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6"
                >
                  <BeakerIcon className="h-12 w-12 text-indigo-600" />
                </motion.div>
                <motion.h3
                  variants={itemVariants}
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  No Agents Found
                </motion.h3>
                <motion.p variants={itemVariants} className="text-gray-600 mb-8 max-w-md mx-auto">
                  Get started by creating your first agent. Each agent can be assigned specific
                  tasks and roles within your projects.
                </motion.p>
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Agent
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredAgents.map(agent => (
                  <motion.div key={agent.id} variants={itemVariants} layoutId={agent.id}>
                    <AgentCard agent={agent} onAssignTask={handleAssignTask} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Agents;
