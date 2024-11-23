import { AggregateRoot } from '../../domain/base/AggregateRoot';
import { Result } from '../../common/Result';
import { ValidationError } from '../../common/errors/DomainError';
import { Email } from '../value-objects/Email';
import { DomainEvent } from '../../domain/events/DomainEvent';

export interface UserProps {
  email: Email;
  name: string;
  isActive: boolean;
}

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super('USER_REGISTERED', userId);
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      email: this.email,
    };
  }
}

export class UserAggregate extends AggregateRoot {
  private props: UserProps;

  private constructor(id: string, props: UserProps) {
    super(id);
    this.props = props;
  }

  public static create(props: {
    email: string;
    name: string;
  }): Result<UserAggregate, ValidationError> {
    const emailOrError = Email.create(props.email);
    if (!emailOrError.isOk()) {
      return Result.fail(emailOrError.getError());
    }

    const user = new UserAggregate(crypto.randomUUID(), {
      email: emailOrError.getValue(),
      name: props.name,
      isActive: false,
    });

    user.addDomainEvent(new UserRegisteredEvent(user.id, props.email));
    return Result.ok(user);
  }

  public activate(): Result<void, ValidationError> {
    if (this.props.isActive) {
      return Result.fail(new ValidationError('User is already active'));
    }

    this.props.isActive = true;
    return Result.ok(undefined);
  }

  get email(): string {
    return this.props.email.value;
  }

  get name(): string {
    return this.props.name;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}
