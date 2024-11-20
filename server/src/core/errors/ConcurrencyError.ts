export class ConcurrencyError extends Error {
  constructor(message = 'Concurrency error occurred') {
    super(message);
    this.name = 'ConcurrencyError';
    Object.setPrototypeOf(this, ConcurrencyError.prototype);
  }
}
