import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { Tab } from '@headlessui/react'
import { motion } from 'framer-motion'
import { RootState } from '@/store'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import TaskList from './components/TaskList'
import AgentAssignments from './components/AgentAssignments'
import IntegrationPanel from './components/IntegrationPanel'
import EnvironmentManager from './components/EnvironmentManager'
import ProjectMetrics from './components/ProjectMetrics'
import {
  ChartBarIcon,
  CogIcon,
  CommandLineIcon,
  PuzzlePieceIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

function ProjectDetails() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const project = useSelector((state: RootState) => 
    state.projects.projects.find(p => p.id === projectId)
  )

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 inline-flex items-center space-x-2 text-blue-500 hover:text-blue-700"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Projects</span>
        </button>
      </div>
    )
  }

  const tabs = [
    { name: 'Overview', icon: ChartBarIcon },
    { name: 'Tasks', icon: ClipboardDocumentListIcon },
    { name: 'Agents', icon: UserGroupIcon },
    { name: 'Integrations', icon: PuzzlePieceIcon },
    { name: 'Environments', icon: CommandLineIcon },
    { name: 'Settings', icon: CogIcon },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <Badge status={project.status} />
          </div>
          <p className="mt-1 text-gray-500">{project.description}</p>
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${selected
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/[0.12]'
                } flex items-center justify-center space-x-2`
              }
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <ProjectMetrics project={project} />
          </Tab.Panel>
          <Tab.Panel>
            <TaskList project={project} />
          </Tab.Panel>
          <Tab.Panel>
            <AgentAssignments project={project} />
          </Tab.Panel>
          <Tab.Panel>
            <IntegrationPanel project={project} />
          </Tab.Panel>
          <Tab.Panel>
            <EnvironmentManager project={project} />
          </Tab.Panel>
          <Tab.Panel>
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Project Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-assign Tasks</p>
                    <p className="text-sm text-gray-500">Automatically assign tasks to available agents</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={project.settings.autoAssign}
                    className="toggle"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require Review</p>
                    <p className="text-sm text-gray-500">Require review before task completion</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={project.settings.requireReview}
                    className="toggle"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Change Notifications</p>
                    <p className="text-sm text-gray-500">Notify team on project changes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={project.settings.notifyOnChange}
                    className="toggle"
                  />
                </div>
              </div>
            </Card>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

export default ProjectDetails
