import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetTaskQuery {
  @IsNotEmpty()
  @IsUUID()
  readonly taskId: string;

  constructor(taskId: string) {
    this.taskId = taskId;
  }
}
