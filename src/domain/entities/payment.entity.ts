export class Payment {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly userId: string,
    public readonly stripePaymentIntentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: string,
    public readonly stripeCustomerId?: string,
    public readonly paymentMethod?: string,
    public readonly lastFourDigits?: string,
    public readonly metadata?: Record<string, any>,
    public readonly paidAt?: Date,
    public readonly failedAt?: Date,
    public readonly failureReason?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
