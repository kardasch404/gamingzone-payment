export class IdempotencyKey {
  constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly requestHash: string,
    public readonly expiresAt: Date,
    public readonly response?: Record<string, any>,
    public readonly createdAt?: Date,
  ) {}
}
