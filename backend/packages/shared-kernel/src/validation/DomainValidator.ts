import {
  validate,
  ValidationError,
  ValidatorOptions,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Result } from '../common/Result';

export class ValidationFailedError extends Error {
  constructor(public readonly errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationFailedError';
  }
}

export interface IDomainValidator {
  validate<T extends object>(target: T): Promise<Result<ValidationError[]>>;
  validateValue<T>(
    value: T,
    validationRules: (value: T) => boolean,
    message?: string
  ): Result<void>;
}

export class DomainValidator implements IDomainValidator {
  private readonly options: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
  };

  async validate<T extends object>(target: T): Promise<Result<ValidationError[]>> {
    try {
      const errors = await validate(target, this.options);
      return errors.length > 0 ? Result.fail(new ValidationFailedError(errors)) : Result.ok(errors);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  validateValue<T>(
    value: T,
    validationRules: (value: T) => boolean,
    message = 'Validation failed'
  ): Result<void> {
    try {
      const isValid = validationRules(value);
      return isValid ? Result.ok(undefined) : Result.fail(new Error(message));
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

export class BusinessRuleValidator {
  static validate(rule: boolean, message: string): Result<void> {
    return rule ? Result.ok(undefined) : Result.fail(new Error(message));
  }

  static combine(results: Result<any>[]): Result<void> {
    const failures = results.filter(result => !result.isOk());
    if (failures.length === 0) {
      return Result.ok(undefined);
    }

    const errorMessages = failures
      .map(failure => failure.getError()?.message)
      .filter(message => message)
      .join(', ');

    return Result.fail(new Error(errorMessages));
  }
}

// Custom validation decorators
export function ValidateCustomRule(validationRule: (value: any) => boolean, message: string) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      name: 'validateCustomRule',
      target: target.constructor,
      propertyName: propertyName,
      options: {
        message,
      } as ValidationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return validationRule(value);
        },
      },
    });
  };
}
