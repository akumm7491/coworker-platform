import { Task } from '../Task';
import { TaskBuilder } from './TaskBuilder';
import { TaskStatus, TaskPriority } from '../TaskStatus';
import { validate } from 'class-validator';
import { randomUUID } from 'crypto';

describe('Task', () => {
  describe('creation', () => {
    it('should create a valid task', async () => {
      const createdById = randomUUID();
      const task = TaskBuilder.aTask()
        .withTitle('Test Task')
        .withStatus(TaskStatus.TODO)
        .withPriority(TaskPriority.HIGH)
        .withCreatedById(createdById)
        .build();

      expect(task.title).toBe('Test Task');
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.createdById).toBe(createdById);

      const errors = await validate(task);
      expect(errors).toHaveLength(0);
    });
  });

  describe('status transitions', () => {
    it('should update status correctly', () => {
      const task = TaskBuilder.aTask().build();
      task.status = TaskStatus.IN_PROGRESS;
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('validation', () => {
    it('should require a title with minimum length', async () => {
      const task = new Task();
      task.title = 'ab'; // Less than minimum length of 3
      task.createdById = randomUUID(); // Set required field

      const errors = await validate(task);
      expect(errors.some(error => error.property === 'title')).toBe(true);
    });

    it('should require createdById', async () => {
      const task = new Task();
      task.title = 'Valid Title';
      // Deliberately not setting createdById

      const errors = await validate(task);
      expect(errors.some(error => error.property === 'createdById')).toBe(true);
    });
  });
});
