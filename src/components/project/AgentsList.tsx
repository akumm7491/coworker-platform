import React from 'react';
import { Agent } from '@/types/agent';

interface AgentsListProps {
  agents: Agent[];
  onAgentClick?: (agent: Agent) => void;
}

const typeColors = {
  assistant: 'bg-green-100 text-green-800',
  general: 'bg-blue-100 text-blue-800',
  specialized: 'bg-purple-100 text-purple-800',
  custom: 'bg-gray-100 text-gray-800',
};

const statusColors = {
  idle: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  training: 'bg-blue-100 text-blue-800',
  deployed: 'bg-purple-100 text-purple-800',
  error: 'bg-red-100 text-red-800',
};

const AgentsList: React.FC<AgentsListProps> = ({ agents, onAgentClick }) => {
  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No agents assigned to this project yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onAgentClick?.(agent)}
        >
          <div className="p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {agent.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {agent.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[agent.type] || typeColors.custom}`}>
                    {agent.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {agent.description}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[agent.status]}`}>
                {agent.status}
              </span>
              <div className="flex space-x-2">
                {agent.capabilities.languages.map((language, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentsList;
