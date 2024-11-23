export class Result<T, E extends Error = Error> {
  private constructor(
    private readonly isSuccess: boolean,
    private readonly value?: T,
    private readonly error?: E
  ) {}

  public static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(true, value);
  }

  public static fail<E extends Error>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined, error);
  }

  public isOk(): boolean {
    return this.isSuccess;
  }

  public isFail(): boolean {
    return !this.isSuccess;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value of failed result');
    }
    return this.value as T;
  }

  public getError(): E {
    if (this.isSuccess) {
      throw new Error('Cannot get error of successful result');
    }
    return this.error as E;
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isSuccess) {
      return Result.ok(fn(this.value as T));
    }
    return Result.fail(this.error as E);
  }

  public mapError<F extends Error>(fn: (error: E) => F): Result<T, F> {
    if (!this.isSuccess) {
      return Result.fail(fn(this.error as E));
    }
    return Result.ok(this.value as T);
  }

  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess) {
      return fn(this.value as T);
    }
    return Result.fail(this.error as E);
  }
}
