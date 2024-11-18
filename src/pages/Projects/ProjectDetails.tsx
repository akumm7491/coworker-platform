import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import TaskList from './components/TaskList';
import AgentAssignments from './components/AgentAssignments';
import IntegrationPanel from './components/IntegrationPanel';
import EnvironmentManager from './components/EnvironmentManager';
import ProjectMetrics from './components/ProjectMetrics';
import {
  ChartBarIcon,
  CogIcon,
  CommandLineIcon,
  PuzzlePieceIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  BeakerIcon,
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

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = useSelector((state: RootState) =>
    state.projects.projects.find(p => p.id === projectId)
  );

  if (!project) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50"
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 text-red-500 bg-red-100 rounded-full flex items-center justify-center"
          >
            <BeakerIcon className="w-10 h-10" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/projects')}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Projects
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const tabs = [
    { name: 'Overview', icon: ChartBarIcon },
    { name: 'Tasks', icon: ClipboardDocumentListIcon },
    { name: 'Agents', icon: UserGroupIcon },
    { name: 'Integrations', icon: PuzzlePieceIcon },
    { name: 'Environments', icon: CommandLineIcon },
    { name: 'Settings', icon: CogIcon },
  ];

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
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="flex items-center space-x-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/projects')}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-6 h-6 text-indigo-600" />
            </motion.button>
            <div>
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  {project.name}
                </h1>
                <Badge status={project.status} />
              </div>
              <p className="mt-1 text-gray-600">{project.description}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tab.Group>
              <Tab.List className="flex space-x-2 rounded-xl bg-white/50 backdrop-blur-sm p-2 shadow-lg">
                {tabs.map(tab => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      `w-full rounded-lg py-3 px-4 text-sm font-medium leading-5 transition-all duration-200
                      ${
                        selected
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                      } flex items-center justify-center space-x-2`
                    }
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-6">
                <AnimatePresence mode="wait">
                  <Tab.Panel
                    as={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ProjectMetrics project={project} />
                  </Tab.Panel>
                  <Tab.Panel
                    as={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <TaskList project={project} />
                  </Tab.Panel>
                  <Tab.Panel
                    as={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AgentAssignments project={project} />
                  </Tab.Panel>
                  <Tab.Panel
                    as={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <IntegrationPanel project={project} />
                  </Tab.Panel>
                  <Tab.Panel
                    as={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <EnvironmentManager project={project} />
                  </Tab.Panel>
                  <Tab.Panel
                    as={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Project Settings</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Auto-assign Tasks</p>
                            <p className="text-sm text-gray-500">
                              Automatically assign tasks to available agents
                            </p>
                          </div>
                          <motion.div whileTap={{ scale: 0.9 }}>
                            <input
                              type="checkbox"
                              checked={project.settings.autoAssign}
                              className="toggle toggle-primary"
                            />
                          </motion.div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Require Review</p>
                            <p className="text-sm text-gray-500">
                              Require review before task completion
                            </p>
                          </div>
                          <motion.div whileTap={{ scale: 0.9 }}>
                            <input
                              type="checkbox"
                              checked={project.settings.requireReview}
                              className="toggle toggle-primary"
                            />
                          </motion.div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Change Notifications</p>
                            <p className="text-sm text-gray-500">Notify team on project changes</p>
                          </div>
                          <motion.div whileTap={{ scale: 0.9 }}>
                            <input
                              type="checkbox"
                              checked={project.settings.notifyOnChange}
                              className="toggle toggle-primary"
                            />
                          </motion.div>
                        </div>
                      </div>
                    </Card>
                  </Tab.Panel>
                </AnimatePresence>
              </Tab.Panels>
            </Tab.Group>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ProjectDetails;
