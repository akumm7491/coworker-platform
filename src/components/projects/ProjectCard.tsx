import { Project } from '@/types';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BoltIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (projectId: string) => void;
}

function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Project['type']) => {
    switch (type) {
      case 'analytics':
        return ChartBarIcon;
      case 'automation':
        return BoltIcon;
      case 'research':
        return CpuChipIcon;
      default:
        return ChartBarIcon;
    }
  };

  const TypeIcon = getTypeIcon(project.type);

  return (
    <motion.div
      layout
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <TypeIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          </div>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{project.description}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              project.status
            )}`}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          <span className="text-gray-500 text-sm">•</span>
          <span className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            {project.agents.length} members
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            {project.tasks.filter(task => task.status === 'completed').length}/
            {project.tasks.length} tasks
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onViewDetails(project.id)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View Details
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default ProjectCard;
