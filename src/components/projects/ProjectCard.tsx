import { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  onViewDetails: (projectId: string) => void
}

function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <span className={`px-2 py-1 rounded ${
          project.status === 'active' ? 'bg-green-200' :
          project.status === 'paused' ? 'bg-yellow-200' : 'bg-gray-200'
        }`}>
          {project.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{project.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-500">Agents</p>
          <p className="font-medium">{project.agents.length}</p>
        </div>
        <div>
          <p className="text-gray-500">Tasks</p>
          <p className="font-medium">{project.tasks.length}</p>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Metrics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Completion Rate</p>
            <p className="font-medium">{project.metrics.completionRate}%</p>
          </div>
          <div>
            <p className="text-gray-500">Success Rate</p>
            <p className="font-medium">{project.metrics.taskSuccessRate}%</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onViewDetails(project.id)}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        View Details
      </button>
    </div>
  )
}

export default ProjectCard
