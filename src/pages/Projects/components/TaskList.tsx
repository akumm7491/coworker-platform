import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Project, ProjectTask } from '@/types';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { fetchTasks, updateTask, deleteTask } from '@/store/slices/tasksSlice';
import NewTaskModal from '@/components/project/modals/NewTaskModal';
import TasksList from '@/components/project/TasksList';
import { RootState, AppDispatch } from '@/store';
import { PlusIcon } from '@heroicons/react/24/outline';
import { selectTasksByProject } from '@/store/slices/tasksSlice';

interface TaskListProps {
  projectId: string;
}

const TaskList: React.FC<TaskListProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => selectTasksByProject(state, projectId));
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks(projectId));
  }, [dispatch, projectId]);

  const handleTaskClick = (task: ProjectTask) => {
    // Handle task click - could open task details modal
  };

  const handleNewTask = () => {
    setIsNewTaskModalOpen(true);
  };

  return (
    <div>
      <TasksList 
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onNewTask={handleNewTask}
      />
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        projectId={projectId}
      />
    </div>
  );
};

export default TaskList;
