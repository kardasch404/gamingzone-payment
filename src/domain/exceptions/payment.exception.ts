import { BaseException } from '../../shared/exceptions/base.exception';

export class PaymentException extends BaseException {
  constructor(message: string) {
    super(message, 'PAYMENT_ERROR');
  }
}

export class PaymentNotFoundException extends BaseException {
  constructor(id: string) {
    super(`Payment with id ${id} not found`, 'PAYMENT_NOT_FOUND');
  }
}
