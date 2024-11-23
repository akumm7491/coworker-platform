import { ValueObject } from '@coworker/shared-kernel';
import { Result } from '@coworker/shared-kernel';

interface TaskTitleProps {
  value: string;
}

export class TaskTitle extends ValueObject<TaskTitleProps> {
  private constructor(props: TaskTitleProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(title: string): Result<TaskTitle> {
    if (!title || title.trim().length === 0) {
      return Result.fail('Task title cannot be empty');
    }

    if (title.trim().length > 100) {
      return Result.fail('Task title cannot be longer than 100 characters');
    }

    return Result.ok(new TaskTitle({ value: title.trim() }));
  }
}
