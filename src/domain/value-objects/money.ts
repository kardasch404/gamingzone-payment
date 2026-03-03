export class Money {
  constructor(
    public readonly value: number,
    public readonly currency: string,
  ) {
    if (value < 0) {
      throw new Error('Money value cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Invalid currency code');
    }
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.value + other.value, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.value - other.value, this.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.value > other.value;
  }

  equals(other: Money): boolean {
    return this.value === other.value && this.currency === other.currency;
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error('Cannot operate on different currencies');
    }
  }
}
