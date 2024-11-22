import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectTask } from '@/types';
import { fetchTasks } from '@/store/slices/tasksSlice';
import NewTaskModal from '@/components/project/modals/NewTaskModal';
import TasksList from '@/components/project/TasksList';
import { RootState, AppDispatch } from '@/store';
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

  const handleTaskClick = (_task: ProjectTask) => {
    // Handle task click - could open task details modal
  };

  const handleNewTask = () => {
    setIsNewTaskModalOpen(true);
  };

  return (
    <div>
      <TasksList tasks={tasks} onTaskClick={handleTaskClick} onNewTask={handleNewTask} />
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        projectId={projectId}
      />
    </div>
  );
};

export default TaskList;
