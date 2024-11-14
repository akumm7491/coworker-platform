import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Project, ProjectEnvironment } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { updateProject } from '@/store/slices/projectsSlice'
import NewEnvironmentModal from '@/components/projects/NewEnvironmentModal'
import {
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface EnvironmentManagerProps {
  project: Project
}

function EnvironmentManager({ project }: EnvironmentManagerProps) {
  const dispatch = useDispatch()
  const [isNewEnvironmentModalOpen, setIsNewEnvironmentModalOpen] = useState(false)
  const [environmentToEdit, setEnvironmentToEdit] = useState<ProjectEnvironment | undefined>()

  const handleDeleteEnvironment = (environmentId: string) => {
    const updatedProject = {
      ...project,
      environments: project.environments.filter(env => env.id !== environmentId)
    }
    dispatch(updateProject(updatedProject))
  }

  const handleEditEnvironment = (environment: ProjectEnvironment) => {
    setEnvironmentToEdit(environment)
    setIsNewEnvironmentModalOpen(true)
  }

  const handleDeploy = (environmentId: string) => {
    const updatedProject = {
      ...project,
      environments: project.environments.map(env =>
        env.id === environmentId
          ? { ...env, lastDeploy: new Date().toISOString() }
          : env
      )
    }
    dispatch(updateProject(updatedProject))
  }

  const handleModalClose = () => {
    setIsNewEnvironmentModalOpen(false)
    setEnvironmentToEdit(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Environments</h3>
        <button
          onClick={() => setIsNewEnvironmentModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Environment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.environments.map((env) => (
          <Card key={env.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{env.name}</h4>
                <p className="text-sm text-gray-500 capitalize">{env.type}</p>
              </div>
              <Badge status={env.status === 'active' ? 'active' : 'paused'} />
            </div>
            
            {env.url && (
              <a
                href={env.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-blue-500 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>{env.url}</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Last deploy: {env.lastDeploy ? new Date(env.lastDeploy).toLocaleString() : 'Never'}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeploy(env.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Deploy"
                >
                  <ArrowPathIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleEditEnvironment(env)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteEnvironment(env.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <NewEnvironmentModal
        isOpen={isNewEnvironmentModalOpen}
        onClose={handleModalClose}
        project={project}
        environmentToEdit={environmentToEdit}
      />

      {project.repository && (
        <Card className="p-6">
          <h4 className="text-lg font-medium mb-4">Repository Information</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Repository URL</span>
              <a
                href={project.repository.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>{project.repository.url}</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Branch</span>
              <span className="font-medium">{project.repository.branch}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Commit</span>
              <span className="font-medium">{project.repository.lastCommit}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default EnvironmentManager
