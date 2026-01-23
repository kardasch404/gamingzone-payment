import { PaymentException, PaymentNotFoundException } from './payment.exception';

describe('Payment Exceptions', () => {
  describe('PaymentException', () => {
    it('should create payment exception', () => {
      const exception = new PaymentException('Payment failed');
      expect(exception.message).toBe('Payment failed');
      expect(exception.code).toBe('PAYMENT_ERROR');
      expect(exception.name).toBe('PaymentException');
    });
  });

  describe('PaymentNotFoundException', () => {
    it('should create payment not found exception', () => {
      const exception = new PaymentNotFoundException('123');
      expect(exception.message).toBe('Payment with id 123 not found');
      expect(exception.code).toBe('PAYMENT_NOT_FOUND');
      expect(exception.name).toBe('PaymentNotFoundException');
    });
  });
});
