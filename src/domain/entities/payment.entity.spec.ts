import { Payment } from './payment.entity';

describe('Payment Entity', () => {
  it('should create payment entity', () => {
    const payment = new Payment(
      '123',
      'user-1',
      1000,
      'usd',
      'pending',
      'pi_123',
      'cs_123',
      { orderId: 'order-1' },
    );

    expect(payment.id).toBe('123');
    expect(payment.userId).toBe('user-1');
    expect(payment.amount).toBe(1000);
    expect(payment.currency).toBe('usd');
    expect(payment.status).toBe('pending');
    expect(payment.stripePaymentId).toBe('pi_123');
    expect(payment.stripeSessionId).toBe('cs_123');
    expect(payment.metadata).toEqual({ orderId: 'order-1' });
  });

  it('should create payment without optional fields', () => {
    const payment = new Payment('123', 'user-1', 1000, 'usd', 'pending');

    expect(payment.id).toBe('123');
    expect(payment.stripePaymentId).toBeUndefined();
    expect(payment.stripeSessionId).toBeUndefined();
    expect(payment.metadata).toBeUndefined();
  });
});
