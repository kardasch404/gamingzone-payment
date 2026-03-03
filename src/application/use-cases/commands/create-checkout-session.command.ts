export class CreateCheckoutSessionCommand {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly email?: string,
    public readonly idempotencyKey?: string,
  ) {}
}
