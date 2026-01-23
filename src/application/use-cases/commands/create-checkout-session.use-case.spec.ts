import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CreateCheckoutSessionUseCase } from './create-checkout-session.use-case';
import { StripeService } from '../../../infrastructure/external/stripe/stripe.service';
import { IdempotencyService } from '../../services/idempotency.service';
import { CreateCheckoutSessionCommand } from './create-checkout-session.command';

describe('CreateCheckoutSessionUseCase', () => {
  let useCase: CreateCheckoutSessionUseCase;
  let stripeService: jest.Mocked<StripeService>;
  let idempotencyService: jest.Mocked<IdempotencyService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCheckoutSessionUseCase,
        {
          provide: StripeService,
          useValue: {
            createCheckoutSession: jest.fn(),
          },
        },
        {
          provide: IdempotencyService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'stripe.successUrl') return 'http://localhost:3001/success';
              if (key === 'stripe.cancelUrl') return 'http://localhost:3001/cancel';
              return null;
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateCheckoutSessionUseCase>(CreateCheckoutSessionUseCase);
    stripeService = module.get(StripeService);
    idempotencyService = module.get(IdempotencyService);
  });

  it('should create checkout session successfully', async () => {
    const command = new CreateCheckoutSessionCommand('order-1', 'user-1', 'test@example.com');
    
    idempotencyService.get.mockResolvedValue(null);
    stripeService.createCheckoutSession.mockResolvedValue({
      id: 'cs_123',
      url: 'https://checkout.stripe.com/pay/cs_123',
    } as any);

    const result = await useCase.execute(command);

    expect(result.sessionId).toBe('cs_123');
    expect(result.sessionUrl).toBe('https://checkout.stripe.com/pay/cs_123');
    expect(result.paymentId).toBeDefined();
    expect(idempotencyService.set).toHaveBeenCalled();
  });

  it('should return cached response if exists', async () => {
    const command = new CreateCheckoutSessionCommand('order-1', 'user-1', 'test@example.com', 'key-123');
    const cachedResponse = {
      sessionId: 'cs_cached',
      sessionUrl: 'https://cached.url',
      paymentId: 'payment-cached',
    };

    idempotencyService.get.mockResolvedValue(cachedResponse);

    const result = await useCase.execute(command);

    expect(result).toEqual(cachedResponse);
    expect(stripeService.createCheckoutSession).not.toHaveBeenCalled();
  });
});
