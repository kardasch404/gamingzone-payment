import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import {
  StripePaymentException,
  InvalidWebhookSignatureException,
  StripeRefundException,
} from './stripe.exceptions';

jest.mock('stripe');

describe('StripeService', () => {
  let service: StripeService;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(async () => {
    mockStripe = {
      paymentIntents: {
        create: jest.fn(),
        confirm: jest.fn(),
        retrieve: jest.fn(),
      },
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      refunds: {
        create: jest.fn(),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    } as any;

    (Stripe as any).mockImplementation(() => mockStripe);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'stripe.secretKey') return 'sk_test_123';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 100000,
        currency: 'mad',
        status: 'requires_payment_method',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(
        mockPaymentIntent as any,
      );

      const result = await service.createPaymentIntent({
        amount: 1000,
        currency: 'MAD',
        orderId: 'order-1',
        userId: 'user-1',
      });

      expect(result).toEqual(mockPaymentIntent);
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100000,
          currency: 'mad',
          metadata: expect.objectContaining({
            orderId: 'order-1',
            userId: 'user-1',
          }),
        }),
      );
    });

    it('should throw StripePaymentException on Stripe error', async () => {
      const stripeError = Object.assign(
        new Error('Card declined'),
        {
          type: 'StripeCardError',
          code: 'card_declined',
        },
      );
      Object.setPrototypeOf(stripeError, Stripe.errors.StripeError.prototype);
      mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

      await expect(
        service.createPaymentIntent({
          amount: 1000,
          currency: 'MAD',
          orderId: 'order-1',
          userId: 'user-1',
        }),
      ).rejects.toThrow(StripePaymentException);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'succeeded',
      };

      mockStripe.paymentIntents.confirm.mockResolvedValue(
        mockPaymentIntent as any,
      );

      const result = await service.confirmPayment('pi_123', 'pm_123');

      expect(result).toEqual(mockPaymentIntent);
      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith('pi_123', {
        payment_method: 'pm_123',
      });
    });
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session successfully', async () => {
      const mockSession = {
        id: 'cs_123',
        url: 'https://checkout.stripe.com/pay/cs_123',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession as any);

      const result = await service.createCheckoutSession({
        orderId: 'order-1',
        userId: 'user-1',
        currency: 'MAD',
        items: [
          {
            name: 'Product 1',
            price: 100,
            quantity: 2,
          },
        ],
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(result).toEqual(mockSession);
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalled();
    });
  });

  describe('createRefund', () => {
    it('should create full refund successfully', async () => {
      const mockRefund = {
        id: 're_123',
        amount: 100000,
        status: 'succeeded',
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund as any);

      const result = await service.createRefund('pi_123');

      expect(result).toEqual(mockRefund);
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: undefined,
        reason: undefined,
      });
    });

    it('should create partial refund successfully', async () => {
      const mockRefund = {
        id: 're_123',
        amount: 50000,
        status: 'succeeded',
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund as any);

      const result = await service.createRefund('pi_123', 500, 'requested_by_customer');

      expect(result).toEqual(mockRefund);
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 50000,
        reason: 'requested_by_customer',
      });
    });

    it('should throw StripeRefundException on error', async () => {
      const stripeError = Object.assign(
        new Error('Invalid payment intent'),
        {
          type: 'StripeInvalidRequestError',
        },
      );
      Object.setPrototypeOf(stripeError, Stripe.errors.StripeError.prototype);
      mockStripe.refunds.create.mockRejectedValue(stripeError);

      await expect(service.createRefund('pi_123')).rejects.toThrow(
        StripeRefundException,
      );
    });
  });

  describe('retrievePaymentIntent', () => {
    it('should retrieve payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 100000,
        status: 'succeeded',
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(
        mockPaymentIntent as any,
      );

      const result = await service.retrievePaymentIntent('pi_123');

      expect(result).toEqual(mockPaymentIntent);
      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify webhook signature successfully', () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any);

      const result = service.verifyWebhookSignature(
        'payload',
        'signature',
        'secret',
      );

      expect(result).toEqual(mockEvent);
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        'payload',
        'signature',
        'secret',
      );
    });

    it('should throw InvalidWebhookSignatureException on error', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() =>
        service.verifyWebhookSignature('payload', 'signature', 'secret'),
      ).toThrow(InvalidWebhookSignatureException);
    });
  });

  describe('getClient', () => {
    it('should return Stripe client', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
    });
  });
});
