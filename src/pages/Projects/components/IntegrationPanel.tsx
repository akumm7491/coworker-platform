import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { Project, ProjectIntegration } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { updateProject } from '@/store/slices/projectsSlice';
import NewIntegrationModal from '@/components/projects/NewIntegrationModal';
import EditIntegrationModal from '@/components/projects/EditIntegrationModal';
import { PlusIcon, ArrowPathIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface IntegrationPanelProps {
  project: Project;
}

function IntegrationPanel({ project }: IntegrationPanelProps) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [isNewIntegrationModalOpen, setIsNewIntegrationModalOpen] = useState(false);
  const [integrationToEdit, setIntegrationToEdit] = useState<ProjectIntegration | null>(null);

  const handleDeleteIntegration = (integrationId: string) => {
    const updatedProject = {
      ...project,
      integrations: project.integrations.filter(i => i.id !== integrationId),
    };
    dispatch(updateProject(updatedProject));
  };

  const handleEditIntegration = (integration: ProjectIntegration) => {
    setIntegrationToEdit(integration);
  };

  const handleCloseEditModal = () => {
    setIntegrationToEdit(null);
  };

  const handleSyncIntegration = (integrationId: string) => {
    const updatedProject = {
      ...project,
      integrations: project.integrations.map(i =>
        i.id === integrationId ? { ...i, lastSync: new Date().toISOString() } : i
      ),
    };
    dispatch(updateProject(updatedProject));
  };

  const mapIntegrationStatus = (
    status: ProjectIntegration['status']
  ): 'completed' | 'error' | 'active' | 'paused' | 'idle' | 'working' => {
    switch (status) {
      case 'active':
        return 'active';
      case 'inactive':
        return 'idle';
      case 'error':
        return 'error';
      default:
        return 'idle';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Integrations</h3>
        <button
          onClick={() => setIsNewIntegrationModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Integration</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.integrations.map(integration => (
          <Card key={integration.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{integration.name}</h4>
                <p className="text-sm text-gray-500">
                  Last sync: {new Date(integration.lastSync).toLocaleString()}
                </p>
              </div>
              <Badge status={mapIntegrationStatus(integration.status)} />
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handleSyncIntegration(integration.id)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Sync Now</span>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditIntegration(integration)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Edit integration"
                >
                  <PencilIcon className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteIntegration(integration.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Delete integration"
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <NewIntegrationModal
        isOpen={isNewIntegrationModalOpen}
        onClose={() => setIsNewIntegrationModalOpen(false)}
        project={project}
      />

      {integrationToEdit && (
        <EditIntegrationModal
          isOpen={!!integrationToEdit}
          onClose={handleCloseEditModal}
          project={project}
          integration={integrationToEdit}
        />
      )}
    </div>
  );
}

export default IntegrationPanel;
