import { Test, TestingModule } from '@nestjs/testing';
import { CreateRefundUseCase } from './create-refund.use-case';
import { StripeService } from '../../../infrastructure/external/stripe/stripe.service';
import { CreateRefundCommand } from './create-refund.command';

describe('CreateRefundUseCase', () => {
  let useCase: CreateRefundUseCase;
  let stripeService: jest.Mocked<StripeService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRefundUseCase,
        {
          provide: StripeService,
          useValue: {
            createRefund: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateRefundUseCase>(CreateRefundUseCase);
    stripeService = module.get(StripeService);
  });

  it('should create refund successfully', async () => {
    const command = new CreateRefundCommand('payment-1', 500, 'Customer request');

    stripeService.createRefund.mockResolvedValue({
      id: 're_123',
      amount: 50000,
      status: 'succeeded',
    } as any);

    const result = await useCase.execute(command);

    expect(result.id).toBeDefined();
    expect(result.amount).toBe(500);
    expect(result.stripeRefundId).toBe('re_123');
    expect(stripeService.createRefund).toHaveBeenCalledWith('pi_123', 500, 'Customer request');
  });

  it('should create full refund when amount not specified', async () => {
    const command = new CreateRefundCommand('payment-1', undefined, 'Full refund');

    stripeService.createRefund.mockResolvedValue({
      id: 're_123',
      amount: 100000,
      status: 'succeeded',
    } as any);

    const result = await useCase.execute(command);

    expect(result.amount).toBe(1000);
  });
});
