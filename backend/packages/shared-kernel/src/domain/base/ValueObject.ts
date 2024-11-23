interface ValueObjectProps {
  [index: string]: any;
}

/**
 * @class ValueObject
 * @description A base class for Value Objects in domain-driven design.
 * Value Objects are immutable and their equality is based on their structural property values rather than identity.
 */
export abstract class ValueObject<T extends ValueObjectProps> {
  protected readonly props: T;

  constructor(props: T) {
    this.validateProps(props);
    this.props = Object.freeze(props);
  }

  /**
   * Validates the properties during construction.
   * Override this method to add custom validation logic.
   */
  protected validateProps(props: T): void {
    if (props === null || props === undefined) {
      throw new Error('Props cannot be null or undefined');
    }
  }

  /**
   * Checks equality with another Value Object
   */
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }

    if (vo.props === undefined) {
      return false;
    }

    return this.isPropsEqual(this.props, vo.props);
  }

  /**
   * Deep comparison of props
   */
  private isPropsEqual(props1: T, props2: T): boolean {
    if (Object.keys(props1).length !== Object.keys(props2).length) {
      return false;
    }

    return Object.keys(props1).every(key => {
      const val1 = props1[key];
      const val2 = props2[key];

      if (val1 instanceof Date && val2 instanceof Date) {
        return val1.getTime() === val2.getTime();
      }

      if (val1 instanceof ValueObject && val2 instanceof ValueObject) {
        return val1.equals(val2);
      }

      if (Array.isArray(val1) && Array.isArray(val2)) {
        return JSON.stringify(val1) === JSON.stringify(val2);
      }

      return val1 === val2;
    });
  }

  /**
   * Creates a copy of the Value Object with updated props
   */
  protected copyWith(props: Partial<T>): ValueObject<T> {
    return new (this.constructor as any)({
      ...this.props,
      ...props,
    });
  }

  /**
   * Serializes the Value Object to a plain object
   */
  public toJSON(): T {
    const plainObject: any = {};

    for (const [key, value] of Object.entries(this.props)) {
      if (value instanceof ValueObject) {
        plainObject[key] = value.toJSON();
      } else if (value instanceof Date) {
        plainObject[key] = value.toISOString();
      } else if (Array.isArray(value)) {
        plainObject[key] = value.map(item => (item instanceof ValueObject ? item.toJSON() : item));
      } else {
        plainObject[key] = value;
      }
    }

    return plainObject as T;
  }
}
