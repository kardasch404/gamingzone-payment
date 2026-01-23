import { DomainEvent } from './domain-event';

export class PaymentInitiatedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
  ) {
    super();
  }

  getEventName(): string {
    return 'PaymentInitiated';
  }
}

export class PaymentProcessingEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
  ) {
    super();
  }

  getEventName(): string {
    return 'PaymentProcessing';
  }
}

export class PaymentSucceededEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly paymentIntentId: string,
  ) {
    super();
  }

  getEventName(): string {
    return 'PaymentSucceeded';
  }
}

export class PaymentFailedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly reason: string,
  ) {
    super();
  }

  getEventName(): string {
    return 'PaymentFailed';
  }
}

export class PaymentCancelledEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
  ) {
    super();
  }

  getEventName(): string {
    return 'PaymentCancelled';
  }
}

export class RefundRequestedEvent extends DomainEvent {
  constructor(
    public readonly refundId: string,
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly reason: string,
  ) {
    super();
  }

  getEventName(): string {
    return 'RefundRequested';
  }
}

export class RefundProcessedEvent extends DomainEvent {
  constructor(
    public readonly refundId: string,
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly currency: string,
  ) {
    super();
  }

  getEventName(): string {
    return 'RefundProcessed';
  }
}
