import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { Project } from '@/types/project';
import TasksList from '@/components/project/TasksList';
import AgentsList from '@/components/project/AgentsList';
import IntegrationsList from '@/components/project/IntegrationsList';
import { fetchProjects } from '@/store/slices/projectsSlice';

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
  const { projects, loading, error } = useSelector((state: RootState) => state.projects);
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    document.title = project ? `${project.name} - Project Details` : 'Project Details';
  }, [project]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load project details.</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Project not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
                {project.status}
              </span>
              {project.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors">
            Edit Project
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            {['Tasks', 'Agents', 'Integrations'].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <TabPanel value={activeTab} index={0}>
          <TasksList tasks={project.tasks || []} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <AgentsList agents={project.agents || []} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <IntegrationsList integrations={project.integrations || []} />
        </TabPanel>
      </div>
    </div>
  );
};

export default ProjectDetails;
