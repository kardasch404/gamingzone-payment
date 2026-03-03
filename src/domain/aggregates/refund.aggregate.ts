import { generateUuidV7 } from '../../shared/utils/uuid.util';
import { Money } from '../value-objects/money';
import { RefundStatus } from '../value-objects/refund-status';
import { DomainEvent } from '../events/domain-event';
import { RefundProcessedEvent } from '../events/payment.events';

export class RefundAggregate {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: string,
    public readonly paymentId: string,
    public readonly amount: Money,
    public readonly reason: string,
    public status: RefundStatus,
    public stripeRefundId?: string,
    public processedAt?: Date,
    public failedAt?: Date,
    public failureReason?: string,
    public initiatedBy?: string,
    public readonly createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static create(data: {
    paymentId: string;
    amount: number;
    currency: string;
    reason: string;
    initiatedBy?: string;
  }): RefundAggregate {
    return new RefundAggregate(
      generateUuidV7(),
      data.paymentId,
      new Money(data.amount, data.currency),
      data.reason,
      RefundStatus.PENDING,
      undefined,
      undefined,
      undefined,
      undefined,
      data.initiatedBy,
      new Date(),
    );
  }

  markAsProcessing(): void {
    if (this.status !== RefundStatus.PENDING) {
      throw new Error('Can only process pending refunds');
    }
    this.status = RefundStatus.PROCESSING;
    this.updatedAt = new Date();
  }

  markAsSucceeded(stripeRefundId: string): void {
    if (this.status !== RefundStatus.PROCESSING) {
      throw new Error('Can only succeed processing refunds');
    }
    this.status = RefundStatus.SUCCEEDED;
    this.stripeRefundId = stripeRefundId;
    this.processedAt = new Date();
    this.updatedAt = new Date();

    this.addDomainEvent(
      new RefundProcessedEvent(
        this.id,
        this.paymentId,
        this.amount.value,
        this.amount.currency,
      ),
    );
  }

  markAsFailed(reason: string): void {
    if (![RefundStatus.PENDING, RefundStatus.PROCESSING].includes(this.status)) {
      throw new Error('Can only fail pending or processing refunds');
    }
    this.status = RefundStatus.FAILED;
    this.failedAt = new Date();
    this.failureReason = reason;
    this.updatedAt = new Date();
  }

  getDomainEvents(): DomainEvent[] {
    return this.domainEvents;
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
