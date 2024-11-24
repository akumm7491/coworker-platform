import { ICommand } from '@nestjs/cqrs';

export class DeleteTaskCommand implements ICommand {
  constructor(
    public readonly taskId: string,
    public readonly deletedById: string
  ) {}

  static getCommandName(): string {
    return 'DeleteTaskCommand';
  }
}
