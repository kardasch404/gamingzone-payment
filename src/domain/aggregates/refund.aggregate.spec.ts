import { RefundAggregate } from './refund.aggregate';
import { RefundStatus } from '../value-objects/refund-status';

describe('RefundAggregate', () => {
  describe('create', () => {
    it('should create refund in PENDING status', () => {
      const refund = RefundAggregate.create({
        paymentId: 'payment-1',
        amount: 500,
        currency: 'MAD',
        reason: 'Customer request',
      });

      expect(refund.id).toBeDefined();
      expect(refund.paymentId).toBe('payment-1');
      expect(refund.amount.value).toBe(500);
      expect(refund.amount.currency).toBe('MAD');
      expect(refund.status).toBe(RefundStatus.PENDING);
      expect(refund.reason).toBe('Customer request');
    });
  });

  describe('markAsProcessing', () => {
    it('should transition from PENDING to PROCESSING', () => {
      const refund = RefundAggregate.create({
        paymentId: 'payment-1',
        amount: 500,
        currency: 'MAD',
        reason: 'Test',
      });

      refund.markAsProcessing();

      expect(refund.status).toBe(RefundStatus.PROCESSING);
    });

    it('should throw error if not in PENDING state', () => {
      const refund = RefundAggregate.create({
        paymentId: 'payment-1',
        amount: 500,
        currency: 'MAD',
        reason: 'Test',
      });
      refund.markAsProcessing();

      expect(() => refund.markAsProcessing()).toThrow();
    });
  });

  describe('markAsSucceeded', () => {
    it('should transition from PROCESSING to SUCCEEDED', () => {
      const refund = RefundAggregate.create({
        paymentId: 'payment-1',
        amount: 500,
        currency: 'MAD',
        reason: 'Test',
      });
      refund.markAsProcessing();

      refund.markAsSucceeded('re_123');

      expect(refund.status).toBe(RefundStatus.SUCCEEDED);
      expect(refund.stripeRefundId).toBe('re_123');
      expect(refund.processedAt).toBeDefined();
      expect(refund.getDomainEvents()).toHaveLength(1);
    });
  });

  describe('markAsFailed', () => {
    it('should transition to FAILED state', () => {
      const refund = RefundAggregate.create({
        paymentId: 'payment-1',
        amount: 500,
        currency: 'MAD',
        reason: 'Test',
      });
      refund.markAsProcessing();

      refund.markAsFailed('Insufficient balance');

      expect(refund.status).toBe(RefundStatus.FAILED);
      expect(refund.failureReason).toBe('Insufficient balance');
      expect(refund.failedAt).toBeDefined();
    });
  });
});
