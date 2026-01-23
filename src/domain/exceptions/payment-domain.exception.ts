import { BaseException } from '../../shared/exceptions/base.exception';

export class InvalidPaymentStateException extends BaseException {
  constructor(message: string = 'Invalid payment state transition') {
    super(message, 'INVALID_PAYMENT_STATE');
  }
}

export class CannotRefundException extends BaseException {
  constructor(message: string) {
    super(message, 'CANNOT_REFUND');
  }
}

export class InvalidAmountException extends BaseException {
  constructor(message: string) {
    super(message, 'INVALID_AMOUNT');
  }
}
