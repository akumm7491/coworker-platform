import React from 'react';
import { ProjectTask } from '@/types/task';
import { formatDistanceToNow } from 'date-fns';
import { FlagIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TasksListProps {
  tasks: ProjectTask[];
  onTaskClick?: (task: ProjectTask) => void;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  pending: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
};

const TasksList: React.FC<TasksListProps> = ({ tasks, onTaskClick }) => {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onTaskClick?.(task)}
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
                <p className="text-sm text-gray-500">{task.description}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                  <FlagIcon className="w-4 h-4 mr-1" />
                  {task.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                  {task.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
              </div>
              <div className="flex items-center space-x-4">
                {task.agent && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {task.agent}
                  </span>
                )}
                {task.assignee && (
                  <span className="inline-flex items-center">
                    {task.assignee}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksList;
