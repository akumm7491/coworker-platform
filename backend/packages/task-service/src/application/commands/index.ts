import { ICommand } from '@nestjs/cqrs';

export class CreateTaskCommand implements ICommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly projectId: string,
    public readonly priority: string,
    public readonly dueDate?: Date,
  ) {}
}

export class AssignTaskCommand implements ICommand {
  constructor(
    public readonly taskId: string,
    public readonly agentId: string,
  ) {}
}

export class UpdateTaskStatusCommand implements ICommand {
  constructor(
    public readonly taskId: string,
    public readonly status: string,
  ) {}
}

export class UpdateTaskProgressCommand implements ICommand {
  constructor(
    public readonly taskId: string,
    public readonly progress: number,
  ) {}
}

export class DeleteTaskCommand implements ICommand {
  constructor(
    public readonly taskId: string,
    public readonly reason?: string,
  ) {}
}
