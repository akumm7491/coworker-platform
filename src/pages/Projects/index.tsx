import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchProjects } from '@/store/slices/projectsSlice';
import ProjectCard from '@/components/projects/ProjectCard';
import NewProjectModal from '@/components/projects/NewProjectModal';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  BeakerIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
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

function Projects() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const { projects, loading, error } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleViewDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{
              rotate: 360,
              transition: { duration: 2, repeat: Infinity, ease: 'linear' },
            }}
            className="w-16 h-16 text-indigo-600"
          >
            <BeakerIcon className="w-full h-full" />
          </motion.div>
          <motion.p
            animate={{
              opacity: [1, 0.5, 1],
              transition: { duration: 1.5, repeat: Infinity },
            }}
            className="text-indigo-600 font-medium"
          >
            Loading your projects...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
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
            <ExclamationTriangleIcon className="w-10 h-10" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Projects</h3>
          <p className="text-red-500 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(fetchProjects())}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

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
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
              Projects
            </h1>
            <p className="text-lg text-gray-600">Manage your autonomous agent projects</p>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsNewProjectModalOpen(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Project
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {projects.length === 0 ? (
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
              <motion.h3 variants={itemVariants} className="text-2xl font-bold text-gray-900 mb-2">
                No Projects Yet
              </motion.h3>
              <motion.p variants={itemVariants} className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating your first project. Each project can contain multiple agents
                working together to achieve your goals.
              </motion.p>
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsNewProjectModalOpen(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Project
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {projects.map(project => (
                <motion.div key={project.id} variants={itemVariants} layoutId={project.id}>
                  <ProjectCard project={project} onViewDetails={handleViewDetails} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </motion.div>
  );
}

export default Projects;
