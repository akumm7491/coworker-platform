import { ValueObject } from '@coworker/shared-kernel';
import { Result } from '@coworker/shared-kernel';

interface TaskIdProps {
  value: string;
}

export class TaskId extends ValueObject<TaskIdProps> {
  private constructor(props: TaskIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(id: string): Result<TaskId> {
    if (!id || id.trim().length === 0) {
      return Result.fail('Task ID cannot be empty');
    }

    return Result.ok(new TaskId({ value: id }));
  }
}
