import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import ProjectCard from '@/components/projects/ProjectCard'

function Projects() {
  const { projects } = useSelector((state: RootState) => state.projects)

  const handleViewDetails = (projectId: string) => {
    // Implement project details view logic
    console.log('View project details:', projectId)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  )
}

export default Projects
