import { Payment } from './payment.entity';

describe('Payment Entity', () => {
  it('should create payment entity', () => {
    const payment = new Payment(
      '123',
      'order-1',
      'user-1',
      'pi_123',
      1000,
      'mad',
      'PENDING',
      'cus_123',
      'card',
      '4242',
      { orderId: 'order-1' },
    );

    expect(payment.id).toBe('123');
    expect(payment.orderId).toBe('order-1');
    expect(payment.userId).toBe('user-1');
    expect(payment.stripePaymentIntentId).toBe('pi_123');
    expect(payment.amount).toBe(1000);
    expect(payment.currency).toBe('mad');
    expect(payment.status).toBe('PENDING');
    expect(payment.stripeCustomerId).toBe('cus_123');
    expect(payment.paymentMethod).toBe('card');
    expect(payment.lastFourDigits).toBe('4242');
    expect(payment.metadata).toEqual({ orderId: 'order-1' });
  });

  it('should create payment without optional fields', () => {
    const payment = new Payment('123', 'order-1', 'user-1', 'pi_123', 1000, 'mad', 'PENDING');

    expect(payment.id).toBe('123');
    expect(payment.stripeCustomerId).toBeUndefined();
    expect(payment.paymentMethod).toBeUndefined();
    expect(payment.metadata).toBeUndefined();
  });
});
