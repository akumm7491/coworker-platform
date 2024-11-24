import { UpdateTaskCommand } from '../UpdateTaskCommand';
import { TaskStatus, TaskPriority } from '../../../domain/models/TaskStatus';
import { randomUUID } from 'crypto';
import { validate } from 'class-validator';

describe('UpdateTaskCommand', () => {
  const taskId = randomUUID();

  it('should create a valid update command with all fields', async () => {
    const command = new UpdateTaskCommand({
      taskId,
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
    });

    expect(command.taskId).toBe(taskId);
    expect(command.title).toBe('Updated Task');
    expect(command.description).toBe('Updated Description');
    expect(command.status).toBe(TaskStatus.IN_PROGRESS);
    expect(command.priority).toBe(TaskPriority.HIGH);

    const errors = await validate(command);
    expect(errors).toHaveLength(0);
  });

  it('should create a valid update command with partial fields', async () => {
    const command = new UpdateTaskCommand({
      taskId,
      title: 'Updated Task',
    });

    expect(command.taskId).toBe(taskId);
    expect(command.title).toBe('Updated Task');
    expect(command.description).toBeUndefined();
    expect(command.status).toBeUndefined();
    expect(command.priority).toBeUndefined();

    const errors = await validate(command);
    expect(errors).toHaveLength(0);
  });

  it('should require taskId', async () => {
    const command = new UpdateTaskCommand({} as any);
    const errors = await validate(command);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('taskId');
  });
});
