export abstract class BaseTestBuilder<T> {
  protected entity!: T;

  public build(): T {
    return this.entity;
  }

  public with<K extends keyof T>(property: K, value: T[K]): this {
    this.entity[property] = value;
    return this;
  }
}
