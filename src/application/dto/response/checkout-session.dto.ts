export class CheckoutSessionDTO {
  constructor(
    public readonly sessionId: string,
    public readonly sessionUrl: string,
    public readonly paymentId: string,
  ) {}
}
