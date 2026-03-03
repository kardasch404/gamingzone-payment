import { BaseException } from '../../../shared/exceptions/base.exception';

export class StripePaymentException extends BaseException {
  constructor(
    message: string,
    public readonly stripeCode?: string,
  ) {
    super(message, 'STRIPE_PAYMENT_ERROR');
  }
}

export class InvalidWebhookSignatureException extends BaseException {
  constructor(message: string) {
    super(message, 'INVALID_WEBHOOK_SIGNATURE');
  }
}

export class StripeRefundException extends BaseException {
  constructor(message: string) {
    super(message, 'STRIPE_REFUND_ERROR');
  }
}
