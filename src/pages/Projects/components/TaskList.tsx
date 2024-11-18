import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Project, ProjectTask } from '@/types';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { fetchTasks, updateTask, deleteTask } from '@/store/slices/tasksSlice';
import NewTaskModal from '@/components/projects/NewTaskModal';
import { RootState, AppDispatch } from '@/store';
import { PlusIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TaskListProps {
  project: Project;
}

function TaskList({ project }: TaskListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | ProjectTask['status']>('all');
  const { tasks = [], loading, error } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks(project.id));
  }, [dispatch, project.id]);

  const filteredTasks = tasks.filter(task => (filter === 'all' ? true : task.status === filter));

  const handleDelete = (taskId: string) => {
    dispatch(deleteTask({ projectId: project.id, taskId }));
  };

  const handleStatusChange = (taskId: string, newStatus: ProjectTask['status']) => {
    dispatch(
      updateTask({
        projectId: project.id,
        taskId,
        data: { status: newStatus },
      })
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">{error}</div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('todo')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'todo' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              To Do
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completed
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="w-4 h-4 mr-1.5" />
            Add Task
          </button>
        </div>

        <div className="space-y-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={() => handleDelete(task.id)}
              onStatusChange={status => handleStatusChange(task.id, status)}
            />
          ))}
        </div>
      </Card>

      <NewTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} project={project} />
    </>
  );
}

function TaskCard({
  task,
  onDelete,
  onStatusChange,
}: {
  task: ProjectTask;
  onDelete: () => void;
  onStatusChange: (status: ProjectTask['status']) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusColor = (status: ProjectTask['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusOptions = (currentStatus: ProjectTask['status']) => {
    const allStatuses: ProjectTask['status'][] = ['todo', 'in_progress', 'completed'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
          <p className="mt-1 text-sm text-gray-500">{task.description}</p>
          <div className="mt-2 flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
            >
              {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            {task.dueDate && (
              <span className="text-sm text-gray-500">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="relative ml-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            {isMenuOpen ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                {getStatusOptions(task.status).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      onStatusChange(status);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Move to {status.replace('_', ' ')}
                  </button>
                ))}
                <button
                  onClick={onDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 inline-block mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TaskList;
