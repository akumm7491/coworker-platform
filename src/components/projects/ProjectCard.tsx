import { Project } from '@/types';
import { ChartBarIcon, ClockIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (projectId: string) => void;
}

function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Agents</p>
              <p className="font-medium">{project.agents.length}</p>
            </div>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Tasks</p>
              <p className="font-medium">{project.tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Completion</p>
                <p className="font-medium">{project.metrics.completionRate}%</p>
              </div>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Success Rate</p>
                <p className="font-medium">{project.metrics.taskSuccessRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => onViewDetails(project.id)}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
