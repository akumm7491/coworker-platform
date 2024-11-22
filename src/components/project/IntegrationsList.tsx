import React from 'react';
import { ProjectIntegration } from '@/types/project';
import { formatDistanceToNow } from 'date-fns';
import { CodeBracketIcon, CloudIcon, BugAntIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface IntegrationsListProps {
  integrations: ProjectIntegration[];
  onIntegrationClick?: (integration: ProjectIntegration) => void;
}

const integrationIcons = {
  github: CodeBracketIcon,
  gitlab: CodeBracketIcon,
  jira: BugAntIcon,
  aws: CloudIcon,
  gcp: CloudIcon,
  azure: CloudIcon,
  settings: Cog6ToothIcon,
};

const IntegrationsList: React.FC<IntegrationsListProps> = ({
  integrations,
  onIntegrationClick,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {integrations.map(integration => {
        const IconComponent = integrationIcons[integration.type] || Cog6ToothIcon;

        return (
          <div
            key={integration.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onIntegrationClick?.(integration)}
          >
            <div className="p-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <IconComponent className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{integration.name}</h3>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {integration.type}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {integration.status}
                </span>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Last updated{' '}
                {formatDistanceToNow(new Date(integration.updated_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IntegrationsList;
