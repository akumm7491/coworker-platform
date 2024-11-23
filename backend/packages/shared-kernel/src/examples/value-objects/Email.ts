export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    return new Email(email);
  }

  toString(): string {
    return this.value;
  }
}
