import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Project, ProjectTask } from '@/types'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { fetchTasks, updateTask, deleteTask } from '@/store/slices/tasksSlice'
import NewTaskModal from '@/components/projects/NewTaskModal'
import { RootState } from '@/store'
import {
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface TaskListProps {
  project: Project
}

function TaskList({ project }: TaskListProps) {
  const dispatch = useDispatch()
  const [filter, setFilter] = useState('all')
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks)

  useEffect(() => {
    dispatch(fetchTasks(project.id))
  }, [dispatch, project.id])

  const filteredTasks = tasks.filter(task => 
    filter === 'all' ? true : task.status === filter
  )

  const handleDeleteTask = async (taskId: string) => {
    try {
      await dispatch(deleteTask({ projectId: project.id, taskId })).unwrap();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: ProjectTask['status']) => {
    try {
      await dispatch(updateTask({
        projectId: project.id,
        taskId,
        data: { status: newStatus }
      })).unwrap();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">Error loading tasks: {error}</p>
        <button
          onClick={() => dispatch(fetchTasks(project.id))}
          className="mt-2 text-indigo-600 hover:text-indigo-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border-gray-300"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button
          onClick={() => setIsNewTaskModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={() => handleDeleteTask(task.id)}
            onStatusChange={(status) => handleUpdateTaskStatus(task.id, status)}
          />
        ))}
      </div>

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        project={project}
      />
    </div>
  )
}

function TaskCard({
  task,
  onDelete,
  onStatusChange
}: {
  task: ProjectTask
  onDelete: () => void
  onStatusChange: (status: ProjectTask['status']) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card hover className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              task.priority === 'high' ? 'bg-red-100 text-red-800' :
              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {task.priority}
            </span>
          </div>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 space-y-2"
            >
              <p className="text-gray-600">{task.description}</p>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                {task.dueDate && (
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </motion.div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as ProjectTask['status'])}
            className="rounded-lg border-gray-300 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Card>
  )
}

export default TaskList
