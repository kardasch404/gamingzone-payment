export class Refund {
  constructor(
    public readonly id: string,
    public readonly paymentId: string,
    public readonly stripeRefundId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: string,
    public readonly reason?: string,
    public readonly processedAt?: Date,
    public readonly failedAt?: Date,
    public readonly failureReason?: string,
    public readonly initiatedBy?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
