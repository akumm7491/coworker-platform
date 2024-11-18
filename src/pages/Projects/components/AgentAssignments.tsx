import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { Project, Agent } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { updateProject } from '@/store/slices/projectsSlice';
import { updateAgent } from '@/store/slices/agentsSlice';
import NewAgentModal from '@/components/projects/NewAgentModal';
import EditAgentModal from '@/components/projects/EditAgentModal';
import {
  PlusIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

interface AgentAssignmentsProps {
  project: Project;
}

function AgentAssignments({ project }: AgentAssignmentsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { agents } = useSelector((state: RootState) => state.agents);
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null);
  const [showPerformance, setShowPerformance] = useState<string | null>(null);

  const projectAgents = agents.filter(agent => project.agents.includes(agent.id));

  const handleRemoveAgent = (agentId: string) => {
    const updatedProject = {
      ...project,
      agents: project.agents.filter(id => id !== agentId),
    };
    dispatch(updateProject(updatedProject))
      .unwrap()
      .catch((error: Error) => {
        console.error('Failed to update project:', error);
      });
  };

  const handleToggleAgentStatus = (agent: Agent) => {
    const newStatus = agent.status === 'working' ? 'idle' : 'working';
    dispatch(
      updateAgent({
        ...agent,
        status: newStatus,
      })
    )
      .unwrap()
      .catch((error: Error) => {
        console.error('Failed to update agent status:', error);
      });
  };

  const handleEditAgent = (agent: Agent) => {
    setAgentToEdit(agent);
  };

  const handleCloseEditModal = () => {
    setAgentToEdit(null);
  };

  const renderPerformanceStats = (agent: Agent) => (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Tasks Completed</p>
          <p className="text-lg font-semibold">{agent.performance.tasksCompleted}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-lg font-semibold">{agent.performance.successRate}%</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Avg Time</p>
          <p className="text-lg font-semibold">{agent.performance.averageTime}s</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Capabilities:</p>
        <div className="flex flex-wrap gap-2">
          {agent.capabilities?.map((cap, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {cap}
            </span>
          ))}
        </div>
      </div>

      {agent.currentTask && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Current Task:</p>
          <p className="text-sm text-gray-600 mt-1">{agent.currentTask.title}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${agent.currentTask.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-700">Settings:</p>
          <button
            onClick={() => handleEditAgent(agent)}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            Edit Settings
          </button>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-600">Learning Rate: {agent.learningRate || 1.0}</p>
          <p className="text-sm text-gray-600">
            Max Concurrent Tasks: {agent.maxConcurrentTasks || 3}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Project Agents</h3>
          <p className="text-sm text-gray-500">
            {projectAgents.length} agents assigned to this project
          </p>
        </div>
        <button
          onClick={() => setIsNewAgentModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Agent</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectAgents.map(agent => (
          <Card key={agent.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{agent.name}</h4>
                <p className="text-sm text-gray-500 capitalize">{agent.type}</p>
              </div>
              <Badge status={agent.status} />
            </div>

            <p className="text-sm text-gray-600 mt-2">{agent.description}</p>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowPerformance(showPerformance === agent.id ? null : agent.id)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  <span>Performance</span>
                </button>
                {agent.currentTask && (
                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900">
                    <ClipboardDocumentListIcon className="w-4 h-4" />
                    <span>Current Task</span>
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditAgent(agent)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Edit agent"
                >
                  <PencilIcon className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={() => handleToggleAgentStatus(agent)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title={agent.status === 'working' ? 'Pause agent' : 'Start agent'}
                >
                  {agent.status === 'working' ? (
                    <PauseIcon className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <PlayIcon className="w-5 h-5 text-green-500" />
                  )}
                </button>
                <button
                  onClick={() => handleRemoveAgent(agent.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Remove agent"
                >
                  <TrashIcon className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>

            {showPerformance === agent.id && renderPerformanceStats(agent)}
          </Card>
        ))}
      </div>

      <NewAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={() => setIsNewAgentModalOpen(false)}
        project={project}
      />

      {agentToEdit && (
        <EditAgentModal isOpen={!!agentToEdit} onClose={handleCloseEditModal} agent={agentToEdit} />
      )}
    </div>
  );
}

export default AgentAssignments;
