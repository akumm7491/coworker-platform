import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import TasksList from '@/components/project/TasksList';
import AgentsList from '@/components/project/AgentsList';
import IntegrationsList from '@/components/project/IntegrationsList';
import NewTaskModal from '@/components/project/modals/NewTaskModal';
import NewAgentModal from '@/components/project/modals/NewAgentModal';
import NewIntegrationModal from '@/components/project/modals/NewIntegrationModal';
import ProjectSettingsModal from '@/components/project/modals/ProjectSettingsModal';
import { fetchProjects } from '@/store/slices/projectsSlice';
import { fetchTasks } from '@/store/slices/tasksSlice';
import { fetchAgents } from '@/store/slices/agentsSlice';
import {
  Cog6ToothIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      className="min-h-[400px]"
      {...other}
    >
      {value === index && <div className="py-8">{children}</div>}
    </div>
  );
};

const statusColors = {
  analysis: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  idle: 'bg-gray-100 text-gray-800',
  working: 'bg-blue-100 text-blue-800',
  error: 'bg-red-100 text-red-800',
};

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState(0);
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useSelector((state: RootState) => state.projects);
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
  } = useSelector((state: RootState) => state.tasks);
  const {
    agents,
    loading: agentsLoading,
    error: agentsError,
  } = useSelector((state: RootState) => state.agents);
  const project = projects.find(p => p.id === projectId);

  // Modal states
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [isNewIntegrationModalOpen, setIsNewIntegrationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchAgents());
  }, [dispatch]);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    document.title = project ? `${project.name} - Project Details` : 'Project Details';
  }, [project]);

  if (projectsLoading || tasksLoading || agentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (projectsError || tasksError || agentsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load project details.</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Not Found!</strong>
          <span className="block sm:inline"> Project not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg">
        {/* Project Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{project.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[project.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {project.status}
              </span>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Project Stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completion</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {project.completion}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Tasks</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{tasks.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Agents</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {project.agents_assigned?.length || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Last Updated</dt>
                      <dd className="flex items-baseline">
                        <div className="text-sm font-semibold text-gray-900">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className="px-6 py-4">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab(0)}
                className={`${
                  activeTab === 0
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`${
                  activeTab === 1
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Agents
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`${
                  activeTab === 2
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Integrations
              </button>
            </nav>
          </div>

          {/* Tab Panels */}
          <TabPanel value={activeTab} index={0}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Task
              </button>
            </div>
            <TasksList
              tasks={tasks}
              onTaskClick={task => {
                // Handle task click
                console.log('Task clicked:', task);
              }}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Agents</h2>
              <button
                onClick={() => setIsNewAgentModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Agent
              </button>
            </div>
            <AgentsList
              agents={agents.filter(agent => project?.agents_assigned?.includes(agent.id))}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Integrations</h2>
              <button
                onClick={() => setIsNewIntegrationModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Integration
              </button>
            </div>
            <IntegrationsList
              integrations={project.integrations || []}
              onIntegrationClick={integration => {
                // Handle integration click
                console.log('Integration clicked:', integration);
              }}
            />
          </TabPanel>
        </div>
      </div>

      {/* Modals */}
      {isNewTaskModalOpen && (
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          projectId={project.id}
        />
      )}
      {isNewAgentModalOpen && (
        <NewAgentModal
          isOpen={isNewAgentModalOpen}
          onClose={() => setIsNewAgentModalOpen(false)}
          projectId={project.id}
        />
      )}
      {isNewIntegrationModalOpen && (
        <NewIntegrationModal
          isOpen={isNewIntegrationModalOpen}
          onClose={() => setIsNewIntegrationModalOpen(false)}
          projectId={project.id}
        />
      )}
      {isSettingsModalOpen && (
        <ProjectSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          project={project}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
