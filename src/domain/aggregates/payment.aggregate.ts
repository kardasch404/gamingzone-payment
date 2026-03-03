import { generateUuidV7 } from '../../shared/utils/uuid.util';
import { Money } from '../value-objects/money';
import { PaymentStatus } from '../value-objects/payment-status';
import { RefundAggregate } from './refund.aggregate';
import { DomainEvent } from '../events/domain-event';
import {
  PaymentInitiatedEvent,
  PaymentProcessingEvent,
  PaymentSucceededEvent,
  PaymentFailedEvent,
  PaymentCancelledEvent,
  RefundRequestedEvent,
} from '../events/payment.events';
import {
  InvalidPaymentStateException,
  CannotRefundException,
  InvalidAmountException,
} from '../exceptions/payment-domain.exception';
import { RefundStatus } from '../value-objects/refund-status';

export class PaymentAggregate {
  private domainEvents: DomainEvent[] = [];
  private refunds: RefundAggregate[] = [];

  private constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly userId: string,
    public readonly amount: Money,
    public status: PaymentStatus,
    public stripePaymentIntentId?: string,
    public stripeCustomerId?: string,
    public paymentMethod?: string,
    public lastFourDigits?: string,
    public metadata?: Record<string, any>,
    public paidAt?: Date,
    public failedAt?: Date,
    public failureReason?: string,
    public readonly createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static initiate(data: {
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    stripeCustomerId?: string;
    metadata?: Record<string, any>;
  }): PaymentAggregate {
    if (data.amount <= 0) {
      throw new InvalidAmountException('Payment amount must be positive');
    }

    const payment = new PaymentAggregate(
      generateUuidV7(),
      data.orderId,
      data.userId,
      new Money(data.amount, data.currency),
      PaymentStatus.PENDING,
      undefined,
      data.stripeCustomerId,
      undefined,
      undefined,
      data.metadata,
      undefined,
      undefined,
      undefined,
      new Date(),
    );

    payment.addDomainEvent(
      new PaymentInitiatedEvent(
        payment.id,
        payment.orderId,
        payment.userId,
        payment.amount.value,
        payment.amount.currency,
      ),
    );

    return payment;
  }

  markAsProcessing(): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new InvalidPaymentStateException(
        `Cannot process payment in ${this.status} state`,
      );
    }

    this.status = PaymentStatus.PROCESSING;
    this.updatedAt = new Date();

    this.addDomainEvent(new PaymentProcessingEvent(this.id, this.orderId));
  }

  markAsSucceeded(
    paymentIntentId: string,
    paymentMethod: string,
    lastFourDigits?: string,
  ): void {
    if (this.status !== PaymentStatus.PROCESSING) {
      throw new InvalidPaymentStateException(
        `Cannot succeed payment in ${this.status} state`,
      );
    }

    this.status = PaymentStatus.SUCCEEDED;
    this.stripePaymentIntentId = paymentIntentId;
    this.paymentMethod = paymentMethod;
    this.lastFourDigits = lastFourDigits;
    this.paidAt = new Date();
    this.updatedAt = new Date();

    this.addDomainEvent(
      new PaymentSucceededEvent(
        this.id,
        this.orderId,
        this.amount.value,
        this.amount.currency,
        paymentIntentId,
      ),
    );
  }

  markAsFailed(reason: string): void {
    if (
      ![PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(this.status)
    ) {
      throw new InvalidPaymentStateException(
        `Cannot fail payment in ${this.status} state`,
      );
    }

    this.status = PaymentStatus.FAILED;
    this.failedAt = new Date();
    this.failureReason = reason;
    this.updatedAt = new Date();

    this.addDomainEvent(
      new PaymentFailedEvent(this.id, this.orderId, reason),
    );
  }

  cancel(): void {
    if (
      ![PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(this.status)
    ) {
      throw new InvalidPaymentStateException(
        `Cannot cancel payment in ${this.status} state`,
      );
    }

    this.status = PaymentStatus.CANCELLED;
    this.updatedAt = new Date();

    this.addDomainEvent(new PaymentCancelledEvent(this.id, this.orderId));
  }

  requestRefund(
    amount: number,
    reason: string,
    initiatedBy?: string,
  ): RefundAggregate {
    if (this.status !== PaymentStatus.SUCCEEDED) {
      throw new CannotRefundException('Can only refund succeeded payments');
    }

    const totalRefunded = this.calculateTotalRefunded();
    const refundAmount = new Money(amount, this.amount.currency);

    if (totalRefunded.add(refundAmount).isGreaterThan(this.amount)) {
      throw new CannotRefundException('Refund amount exceeds payment amount');
    }

    const refund = RefundAggregate.create({
      paymentId: this.id,
      amount,
      currency: this.amount.currency,
      reason,
      initiatedBy,
    });

    this.refunds.push(refund);

    // Update payment status
    const newTotal = totalRefunded.add(refundAmount);
    if (newTotal.equals(this.amount)) {
      this.status = PaymentStatus.REFUNDED;
    } else {
      this.status = PaymentStatus.PARTIALLY_REFUNDED;
    }
    this.updatedAt = new Date();

    this.addDomainEvent(
      new RefundRequestedEvent(
        refund.id,
        this.id,
        amount,
        this.amount.currency,
        reason,
      ),
    );

    return refund;
  }

  private calculateTotalRefunded(): Money {
    const total = this.refunds
      .filter((r) => r.status === RefundStatus.SUCCEEDED)
      .reduce((sum, r) => sum + r.amount.value, 0);

    return new Money(total, this.amount.currency);
  }

  getDomainEvents(): DomainEvent[] {
    return this.domainEvents;
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  getRefunds(): RefundAggregate[] {
    return [...this.refunds];
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
