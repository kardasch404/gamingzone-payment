import { RefundAggregate } from '../../../domain/aggregates/refund.aggregate';

export class RefundDTO {
  constructor(
    public readonly id: string,
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: string,
    public readonly reason?: string,
    public readonly stripeRefundId?: string,
  ) {}

  static fromDomain(refund: RefundAggregate): RefundDTO {
    return new RefundDTO(
      refund.id,
      refund.paymentId,
      refund.amount.value,
      refund.amount.currency,
      refund.status,
      refund.reason,
      refund.stripeRefundId,
    );
  }
}
