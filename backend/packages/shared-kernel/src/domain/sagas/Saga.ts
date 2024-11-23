import { Result } from '../../common/Result';
import { IDomainEvent } from '../events/DomainEvent';

export interface SagaStep<TData> {
  execute: (data: TData) => Promise<Result<void>>;
  compensate: (data: TData) => Promise<Result<void>>;
}

export class SagaError extends Error {
  constructor(
    message: string,
    public readonly step: number
  ) {
    super(message);
    this.name = 'SagaError';
  }
}

export interface ISagaState<TData> {
  readonly sagaId: string;
  readonly data: TData;
  currentStep: number;
  status: SagaStatus;
  error?: Error;
}

export enum SagaStatus {
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  COMPENSATING = 'COMPENSATING',
  FAILED = 'FAILED',
}

export abstract class Saga<TData> {
  protected steps: SagaStep<TData>[] = [];
  protected state: ISagaState<TData>;

  constructor(sagaId: string, data: TData) {
    this.state = {
      sagaId,
      data,
      currentStep: 0,
      status: SagaStatus.STARTED,
    };
  }

  protected addStep(step: SagaStep<TData>): void {
    this.steps.push(step);
  }

  async execute(): Promise<Result<void>> {
    try {
      for (let stepIndex = this.state.currentStep; stepIndex < this.steps.length; stepIndex++) {
        const result = await this.steps[stepIndex].execute(this.state.data);
        if (!result.isOk()) {
          await this.compensate(stepIndex);
          return Result.fail(
            new SagaError(`Saga step ${stepIndex} failed: ${result.getError().message}`, stepIndex)
          );
        }
        this.state.currentStep = stepIndex + 1;
      }

      this.state.status = SagaStatus.COMPLETED;
      return Result.ok(undefined);
    } catch (error) {
      await this.compensate(this.state.currentStep);
      return Result.fail(
        new SagaError(
          `Unexpected error in saga step ${this.state.currentStep}: ${error instanceof Error ? error.message : String(error)}`,
          this.state.currentStep
        )
      );
    }
  }

  protected async compensate(fromStep: number): Promise<void> {
    this.state.status = SagaStatus.COMPENSATING;

    for (let stepIndex = fromStep - 1; stepIndex >= 0; stepIndex--) {
      try {
        await this.steps[stepIndex].compensate(this.state.data);
      } catch (error) {
        // Log compensation failure but continue with other compensations
        console.error(
          `Failed to compensate step ${stepIndex}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.state.status = SagaStatus.FAILED;
  }

  getState(): ISagaState<TData> {
    return { ...this.state };
  }
}

// Example implementation of a Saga that coordinates multiple services
export abstract class EventDrivenSaga<TData> extends Saga<TData> {
  protected abstract onStart(): Promise<Result<void>>;
  protected abstract onEvent(event: IDomainEvent): Promise<Result<void>>;
  protected abstract onTimeout(): Promise<Result<void>>;
  protected abstract onComplete(): Promise<Result<void>>;

  async start(): Promise<Result<void>> {
    const result = await this.onStart();
    if (!result.isOk()) {
      this.state.status = SagaStatus.FAILED;
      this.state.error = result.getError();
      return result;
    }
    return this.execute();
  }

  async handleEvent(event: IDomainEvent): Promise<Result<void>> {
    if (this.state.status !== SagaStatus.STARTED) {
      return Result.fail(
        new SagaError(`Cannot handle event in ${this.state.status} state`, this.state.currentStep)
      );
    }

    return this.onEvent(event);
  }

  async timeout(): Promise<Result<void>> {
    if (this.state.status !== SagaStatus.STARTED) {
      return Result.fail(
        new SagaError(`Cannot timeout in ${this.state.status} state`, this.state.currentStep)
      );
    }

    const result = await this.onTimeout();
    if (!result.isOk()) {
      await this.compensate(this.state.currentStep);
    }
    return result;
  }

  async complete(): Promise<Result<void>> {
    if (this.state.status !== SagaStatus.STARTED) {
      return Result.fail(
        new SagaError(`Cannot complete in ${this.state.status} state`, this.state.currentStep)
      );
    }

    const result = await this.onComplete();
    if (!result.isOk()) {
      await this.compensate(this.state.currentStep);
    }
    return result;
  }
}
