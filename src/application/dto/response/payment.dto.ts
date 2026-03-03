import { PaymentAggregate } from '../../../domain/aggregates/payment.aggregate';

export class PaymentDTO {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: string,
    public readonly stripePaymentIntentId?: string,
    public readonly paymentMethod?: string,
    public readonly lastFourDigits?: string,
    public readonly paidAt?: Date,
    public readonly createdAt?: Date,
  ) {}

  static fromDomain(payment: PaymentAggregate): PaymentDTO {
    return new PaymentDTO(
      payment.id,
      payment.orderId,
      payment.userId,
      payment.amount.value,
      payment.amount.currency,
      payment.status,
      payment.stripePaymentIntentId,
      payment.paymentMethod,
      payment.lastFourDigits,
      payment.paidAt,
      payment.createdAt,
    );
  }
}
