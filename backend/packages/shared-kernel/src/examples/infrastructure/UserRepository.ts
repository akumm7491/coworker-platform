import { QueryRunner, Repository } from 'typeorm';
import { BaseDomainRepository } from '../../domain/repositories/DomainRepository';
import { UserAggregate } from '../domain/UserAggregate';
import { Result } from '../../common/Result';
import { ErrorSeverity } from '../../common/errors/BaseError';
import { InfrastructureError } from '../../common/errors/InfrastructureError';
import { Email } from '../value-objects/Email';

export class UserRepository extends BaseDomainRepository<UserAggregate> {
  constructor(
    private readonly repository: Repository<UserAggregate>,
    ...args: ConstructorParameters<typeof BaseDomainRepository>
  ) {
    super(...args);
  }

  async findById(id: string, queryRunner?: QueryRunner): Promise<Result<UserAggregate>> {
    return this.withTransactionContext(
      queryRunner,
      async (qr: QueryRunner): Promise<Result<UserAggregate>> => {
        try {
          const repo = qr.manager.getRepository(UserAggregate);
          const user = await repo.findOne({ where: { id } });

          if (!user) {
            return Result.fail(
              new InfrastructureError(
                `User with id ${id} not found`,
                'USER_NOT_FOUND',
                ErrorSeverity.LOW,
                true,
                { userId: id }
              )
            );
          }

          return Result.ok(user);
        } catch (error) {
          return Result.fail(
            new InfrastructureError(
              `Failed to find user: ${error instanceof Error ? error.message : String(error)}`,
              'USER_FIND_ERROR',
              ErrorSeverity.MEDIUM,
              true,
              { userId: id, error: error instanceof Error ? error.message : String(error) }
            )
          );
        }
      }
    );
  }

  async findByEmail(email: string, queryRunner?: QueryRunner): Promise<Result<UserAggregate>> {
    const emailOrError = Email.create(email);
    if (!emailOrError.isOk()) {
      return Result.fail(emailOrError.getError());
    }

    return this.withTransactionContext(
      queryRunner,
      async (qr: QueryRunner): Promise<Result<UserAggregate>> => {
        try {
          const repo = qr.manager.getRepository(UserAggregate);
          const user = await repo.findOne({
            where: { email: emailOrError.getValue().value },
          });

          if (!user) {
            return Result.fail(
              new InfrastructureError(
                `User with email ${email} not found`,
                'USER_NOT_FOUND',
                ErrorSeverity.LOW,
                true,
                { email }
              )
            );
          }

          return Result.ok(user);
        } catch (error) {
          return Result.fail(
            new InfrastructureError(
              `Failed to find user by email: ${error instanceof Error ? error.message : String(error)}`,
              'USER_FIND_ERROR',
              ErrorSeverity.MEDIUM,
              true,
              { email, error: error instanceof Error ? error.message : String(error) }
            )
          );
        }
      }
    );
  }

  async findByIds(ids: string[], queryRunner?: QueryRunner): Promise<Result<UserAggregate[]>> {
    return this.withTransactionContext(
      queryRunner,
      async (qr: QueryRunner): Promise<Result<UserAggregate[]>> => {
        try {
          const repo = qr.manager.getRepository(UserAggregate);
          const users = await repo.findByIds(ids);
          return Result.ok(users);
        } catch (error) {
          return Result.fail(
            new InfrastructureError(
              `Failed to find users by ids: ${error instanceof Error ? error.message : String(error)}`,
              'USER_FIND_ERROR',
              ErrorSeverity.MEDIUM,
              true,
              { userIds: ids, error: error instanceof Error ? error.message : String(error) }
            )
          );
        }
      }
    );
  }

  async save(entity: UserAggregate, queryRunner?: QueryRunner): Promise<Result<UserAggregate>> {
    return this.withTransactionContext(
      queryRunner,
      async (qr: QueryRunner): Promise<Result<UserAggregate>> => {
        try {
          const repo = qr.manager.getRepository(UserAggregate);
          const savedUser = await repo.save(entity);
          await this.publishEvents(entity);
          return Result.ok(savedUser);
        } catch (error) {
          return Result.fail(
            new InfrastructureError(
              `Failed to save user: ${error instanceof Error ? error.message : String(error)}`,
              'USER_SAVE_ERROR',
              ErrorSeverity.HIGH,
              true,
              { userId: entity.id, error: error instanceof Error ? error.message : String(error) }
            )
          );
        }
      }
    );
  }

  async saveMany(
    entities: UserAggregate[],
    queryRunner?: QueryRunner
  ): Promise<Result<UserAggregate[]>> {
    return this.withTransactionContext(
      queryRunner,
      async (qr: QueryRunner): Promise<Result<UserAggregate[]>> => {
        try {
          const repo = qr.manager.getRepository(UserAggregate);
          const savedUsers = await repo.save(entities);
          await Promise.all(entities.map(entity => this.publishEvents(entity)));
          return Result.ok(savedUsers);
        } catch (error) {
          return Result.fail(
            new InfrastructureError(
              `Failed to save users: ${error instanceof Error ? error.message : String(error)}`,
              'USER_SAVE_ERROR',
              ErrorSeverity.HIGH,
              true,
              {
                userIds: entities.map(e => e.id),
                error: error instanceof Error ? error.message : String(error),
              }
            )
          );
        }
      }
    );
  }

  async delete(id: string, queryRunner?: QueryRunner): Promise<Result<void>> {
    return this.withTransactionContext(
      queryRunner,
      async (qr: QueryRunner): Promise<Result<void>> => {
        try {
          const repo = qr.manager.getRepository(UserAggregate);
          await repo.delete(id);
          return Result.ok(undefined);
        } catch (error) {
          return Result.fail(
            new InfrastructureError(
              `Failed to delete user: ${error instanceof Error ? error.message : String(error)}`,
              'USER_DELETE_ERROR',
              ErrorSeverity.HIGH,
              true,
              { userId: id, error: error instanceof Error ? error.message : String(error) }
            )
          );
        }
      }
    );
  }

  async exists(id: string, queryRunner?: QueryRunner): Promise<Result<boolean>> {
    return this.withTransactionContext(
      queryRunner,
      async (qr: QueryRunner): Promise<Result<boolean>> => {
        try {
          const repo = qr.manager.getRepository(UserAggregate);
          const count = await repo.count({ where: { id } });
          return Result.ok(count > 0);
        } catch (error) {
          return Result.fail(
            new InfrastructureError(
              `Failed to check user existence: ${error instanceof Error ? error.message : String(error)}`,
              'USER_EXISTS_ERROR',
              ErrorSeverity.LOW,
              true,
              { userId: id, error: error instanceof Error ? error.message : String(error) }
            )
          );
        }
      }
    );
  }
}
