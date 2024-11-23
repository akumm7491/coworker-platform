import { validate, ValidatorOptions, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Result } from '../common/Result';
import { ValidationError as DomainValidationError } from '../domain/errors/DomainError';

export class Validator {
  static async validate<T extends object>(
    dto: T,
    options: ValidatorOptions = {}
  ): Promise<Result<T, DomainValidationError>> {
    const errors: ValidationError[] = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      ...options,
    });

    if (errors.length > 0) {
      const errorMessages = this.formatErrors(errors);
      return Result.fail(new DomainValidationError(errorMessages.join(', ')));
    }

    return Result.ok(dto);
  }

  static async validateDTO<T extends object>(
    dtoClass: new () => T,
    plain: Record<string, unknown>,
    options: ValidatorOptions = {}
  ): Promise<Result<T, DomainValidationError>> {
    const dto = plainToInstance(dtoClass, plain);
    return this.validate(dto, options);
  }

  private static formatErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }

      if (error.children?.length) {
        messages.push(...this.formatErrors(error.children));
      }
    }

    return messages;
  }
}
