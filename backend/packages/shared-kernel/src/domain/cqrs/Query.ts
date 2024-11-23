import { Result } from '../../common/Result';

export class QueryHandlerNotFoundError extends Error {
  constructor(queryType: string) {
    super(`No handler registered for query ${queryType}`);
    this.name = 'QueryHandlerNotFoundError';
  }
}

export class QueryHandlingError extends Error {
  constructor(message: string) {
    super(`Query handling failed: ${message}`);
    this.name = 'QueryHandlingError';
  }
}

export interface IQuery<TResult> {
  readonly queryType: string;
  readonly __resultType?: TResult; // Type marker for compile-time type checking
}

export abstract class Query<TResult> implements IQuery<TResult> {
  readonly __resultType?: TResult;

  constructor(public readonly queryType: string) {}
}

export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  handle(query: TQuery): Promise<Result<TResult>>;
}

export interface IQueryBus {
  dispatch<TResult>(query: IQuery<TResult>): Promise<Result<TResult>>;
  register<TQuery extends IQuery<TResult>, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>
  ): void;
}

export class QueryBus implements IQueryBus {
  private handlers: Map<string, IQueryHandler<any, any>> = new Map();

  register<TQuery extends IQuery<TResult>, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>
  ): void {
    if (this.handlers.has(queryType)) {
      throw new Error(`Handler for ${queryType} already registered`);
    }
    this.handlers.set(queryType, handler);
  }

  async dispatch<TResult>(query: IQuery<TResult>): Promise<Result<TResult>> {
    const handler = this.handlers.get(query.queryType);
    if (!handler) {
      return Result.fail(new QueryHandlerNotFoundError(query.queryType));
    }

    try {
      return await handler.handle(query);
    } catch (error) {
      return Result.fail(
        new QueryHandlingError(error instanceof Error ? error.message : String(error))
      );
    }
  }
}
