import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { StripeService } from '../../../infrastructure/external/stripe/stripe.service';
import { WebhookEventRepository } from '../../../infrastructure/database/repositories/webhook-event.repository';
import { ProcessPaymentSuccessUseCase } from '../../../application/use-cases/commands/process-payment-success.use-case';
import { ProcessPaymentFailureUseCase } from '../../../application/use-cases/commands/process-payment-failure.use-case';
import Stripe from 'stripe';

describe('WebhookController', () => {
  let controller: WebhookController;
  let stripeService: jest.Mocked<StripeService>;
  let webhookEventRepo: jest.Mocked<WebhookEventRepository>;
  let processPaymentSuccessUseCase: jest.Mocked<ProcessPaymentSuccessUseCase>;
  let processPaymentFailureUseCase: jest.Mocked<ProcessPaymentFailureUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: StripeService,
          useValue: {
            verifyWebhookSignature: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'stripe.webhookSecret') return 'whsec_test';
              return null;
            }),
          },
        },
        {
          provide: WebhookEventRepository,
          useValue: {
            create: jest.fn(),
            findByStripeEventId: jest.fn(),
            markAsProcessed: jest.fn(),
          },
        },
        {
          provide: ProcessPaymentSuccessUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ProcessPaymentFailureUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    stripeService = module.get(StripeService);
    webhookEventRepo = module.get(WebhookEventRepository);
    processPaymentSuccessUseCase = module.get(ProcessPaymentSuccessUseCase);
    processPaymentFailureUseCase = module.get(ProcessPaymentFailureUseCase);
  });

  describe('handleStripeWebhook', () => {
    const mockRequest = {
      rawBody: Buffer.from('test'),
    } as any;

    it('should handle payment_intent.succeeded event', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            charges: {
              data: [
                {
                  payment_method_details: {
                    type: 'card',
                    card: { last4: '4242' },
                  },
                },
              ],
            },
          } as any,
        },
      } as any;

      stripeService.verifyWebhookSignature.mockReturnValue(mockEvent);
      webhookEventRepo.findByStripeEventId.mockResolvedValue(null);

      const result = await controller.handleStripeWebhook('sig_123', mockRequest);

      expect(result).toEqual({ received: true });
      expect(webhookEventRepo.create).toHaveBeenCalled();
      expect(processPaymentSuccessUseCase.execute).toHaveBeenCalledWith({
        paymentIntentId: 'pi_123',
        paymentMethod: 'card',
        lastFourDigits: '4242',
      });
      expect(webhookEventRepo.markAsProcessed).toHaveBeenCalled();
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_124',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_124',
            last_payment_error: {
              message: 'Card declined',
            },
          } as any,
        },
      } as any;

      stripeService.verifyWebhookSignature.mockReturnValue(mockEvent);
      webhookEventRepo.findByStripeEventId.mockResolvedValue(null);

      const result = await controller.handleStripeWebhook('sig_124', mockRequest);

      expect(result).toEqual({ received: true });
      expect(processPaymentFailureUseCase.execute).toHaveBeenCalledWith({
        paymentIntentId: 'pi_124',
        reason: 'Card declined',
      });
    });

    it('should throw BadRequestException for invalid signature', async () => {
      stripeService.verifyWebhookSignature.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(
        controller.handleStripeWebhook('invalid_sig', mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return early if event already processed', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_125',
        type: 'payment_intent.succeeded',
        data: { object: {} as any },
      } as any;

      stripeService.verifyWebhookSignature.mockReturnValue(mockEvent);
      webhookEventRepo.findByStripeEventId.mockResolvedValue({
        id: '1',
        stripeEventId: 'evt_125',
        eventType: 'payment_intent.succeeded',
        payload: {},
        processed: true,
      } as any);

      const result = await controller.handleStripeWebhook('sig_125', mockRequest);

      expect(result).toEqual({ received: true });
      expect(processPaymentSuccessUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle unhandled event types', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_126',
        type: 'customer.created',
        data: { object: {} as any },
      } as any;

      stripeService.verifyWebhookSignature.mockReturnValue(mockEvent);
      webhookEventRepo.findByStripeEventId.mockResolvedValue(null);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await controller.handleStripeWebhook('sig_126', mockRequest);

      expect(result).toEqual({ received: true });
      expect(consoleSpy).toHaveBeenCalledWith('Unhandled event type: customer.created');
      
      consoleSpy.mockRestore();
    });
  });
});
