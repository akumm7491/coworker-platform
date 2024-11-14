import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Project, ProjectTask } from '@/types'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { updateProject } from '@/store/slices/projectsSlice'
import NewTaskModal from '@/components/projects/NewTaskModal'
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

  const filteredTasks = project.tasks.filter(task => 
    filter === 'all' ? true : task.status === filter
  )

  const handleDeleteTask = (taskId: string) => {
    const updatedProject = {
      ...project,
      tasks: project.tasks.filter(task => task.id !== taskId)
    }
    dispatch(updateProject(updatedProject))
  }

  const handleUpdateTaskStatus = (taskId: string, newStatus: ProjectTask['status']) => {
    const updatedProject = {
      ...project,
      tasks: project.tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    }
    dispatch(updateProject(updatedProject))
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
  const [expanded, setExpanded] = useState(false)

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={() => onStatusChange(task.status === 'completed' ? 'pending' : 'completed')}
          />
          <div>
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-gray-500">
              Due {new Date(task.dueDate || '').toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as ProjectTask['status'])}
            className={`px-2 py-1 rounded-full text-xs ${statusColors[task.status]}`}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-4 pt-4 border-t"
        >
          <p className="text-gray-600 mb-4">{task.description}</p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {task.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded">
                <PencilIcon className="w-5 h-5 text-gray-500" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <TrashIcon className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

export default TaskList
