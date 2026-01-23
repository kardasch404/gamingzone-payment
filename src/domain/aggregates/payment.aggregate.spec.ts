import { PaymentAggregate } from './payment.aggregate';
import { PaymentStatus } from '../value-objects/payment-status';
import { InvalidPaymentStateException, CannotRefundException, InvalidAmountException } from '../exceptions/payment-domain.exception';

describe('PaymentAggregate', () => {
  describe('initiate', () => {
    it('should create payment in PENDING status', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });

      expect(payment.id).toBeDefined();
      expect(payment.orderId).toBe('order-1');
      expect(payment.userId).toBe('user-1');
      expect(payment.amount.value).toBe(1000);
      expect(payment.amount.currency).toBe('MAD');
      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.getDomainEvents()).toHaveLength(1);
      expect(payment.getDomainEvents()[0].getEventName()).toBe('PaymentInitiated');
    });

    it('should throw error for invalid amount', () => {
      expect(() =>
        PaymentAggregate.initiate({
          orderId: 'order-1',
          userId: 'user-1',
          amount: -100,
          currency: 'MAD',
        }),
      ).toThrow(InvalidAmountException);
    });
  });

  describe('markAsProcessing', () => {
    it('should transition from PENDING to PROCESSING', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });

      payment.markAsProcessing();

      expect(payment.status).toBe(PaymentStatus.PROCESSING);
      expect(payment.getDomainEvents()).toHaveLength(2);
    });

    it('should throw error if not in PENDING state', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });
      payment.markAsProcessing();

      expect(() => payment.markAsProcessing()).toThrow(InvalidPaymentStateException);
    });
  });

  describe('markAsSucceeded', () => {
    it('should transition from PROCESSING to SUCCEEDED', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });
      payment.markAsProcessing();

      payment.markAsSucceeded('pi_123', 'card', '4242');

      expect(payment.status).toBe(PaymentStatus.SUCCEEDED);
      expect(payment.stripePaymentIntentId).toBe('pi_123');
      expect(payment.paymentMethod).toBe('card');
      expect(payment.lastFourDigits).toBe('4242');
      expect(payment.paidAt).toBeDefined();
    });

    it('should throw error if not in PROCESSING state', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });

      expect(() => payment.markAsSucceeded('pi_123', 'card')).toThrow(InvalidPaymentStateException);
    });
  });

  describe('markAsFailed', () => {
    it('should transition to FAILED state', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });
      payment.markAsProcessing();

      payment.markAsFailed('Insufficient funds');

      expect(payment.status).toBe(PaymentStatus.FAILED);
      expect(payment.failureReason).toBe('Insufficient funds');
      expect(payment.failedAt).toBeDefined();
    });
  });

  describe('cancel', () => {
    it('should cancel pending payment', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });

      payment.cancel();

      expect(payment.status).toBe(PaymentStatus.CANCELLED);
    });

    it('should throw error if payment already succeeded', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });
      payment.markAsProcessing();
      payment.markAsSucceeded('pi_123', 'card');

      expect(() => payment.cancel()).toThrow(InvalidPaymentStateException);
    });
  });

  describe('requestRefund', () => {
    it('should create refund for succeeded payment', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });
      payment.markAsProcessing();
      payment.markAsSucceeded('pi_123', 'card');

      const refund = payment.requestRefund(500, 'Customer request');

      expect(refund).toBeDefined();
      expect(refund.amount.value).toBe(500);
      expect(payment.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
      expect(payment.getRefunds()).toHaveLength(1);
    });

    it('should mark as REFUNDED for full refund', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });
      payment.markAsProcessing();
      payment.markAsSucceeded('pi_123', 'card');

      payment.requestRefund(1000, 'Full refund');

      expect(payment.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should throw error if payment not succeeded', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });

      expect(() => payment.requestRefund(500, 'Test')).toThrow(CannotRefundException);
    });

    it('should throw error if refund exceeds payment amount', () => {
      const payment = PaymentAggregate.initiate({
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
      });
      payment.markAsProcessing();
      payment.markAsSucceeded('pi_123', 'card');

      expect(() => payment.requestRefund(1500, 'Test')).toThrow(CannotRefundException);
    });
  });
});
