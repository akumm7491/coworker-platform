import { validate } from 'class-validator';
import { BaseError, ErrorCategory, ErrorSeverity } from '../common/errors/BaseError';

export class DomainValidator {
  static async validate(entity: object): Promise<void> {
    const errors = await validate(entity);
    if (errors.length > 0) {
      throw new BaseError(
        `Validation failed: ${errors.map(e => Object.values(e.constraints || {})).join(', ')}`,
        ErrorCategory.Domain,
        ErrorSeverity.Medium
      );
    }
  }
}
