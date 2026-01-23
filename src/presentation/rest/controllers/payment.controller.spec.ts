import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { CreateCheckoutSessionUseCase } from '../../../application/use-cases/commands/create-checkout-session.use-case';
import { CreateRefundUseCase } from '../../../application/use-cases/commands/create-refund.use-case';
import { GetPaymentQueryHandler } from '../../../application/use-cases/queries/get-payment.query';
import { CreateCheckoutRequestDto } from '../../../application/dto/request/create-checkout.dto';
import { CreateRefundRequestDto } from '../../../application/dto/request/create-refund.dto';

describe('PaymentController', () => {
  let controller: PaymentController;
  let createCheckoutSessionUseCase: jest.Mocked<CreateCheckoutSessionUseCase>;
  let createRefundUseCase: jest.Mocked<CreateRefundUseCase>;
  let getPaymentQueryHandler: jest.Mocked<GetPaymentQueryHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: CreateCheckoutSessionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CreateRefundUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetPaymentQueryHandler,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    createCheckoutSessionUseCase = module.get(CreateCheckoutSessionUseCase);
    createRefundUseCase = module.get(CreateRefundUseCase);
    getPaymentQueryHandler = module.get(GetPaymentQueryHandler);
  });

  describe('createCheckout', () => {
    it('should create checkout session', async () => {
      const dto: CreateCheckoutRequestDto = {
        orderId: 'order-1',
        userId: 'user-1',
        email: 'test@example.com',
      };

      const expectedResult = {
        sessionId: 'cs_123',
        sessionUrl: 'https://checkout.stripe.com/pay/cs_123',
        paymentId: 'payment-123',
      };

      createCheckoutSessionUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.createCheckout(dto);

      expect(result).toEqual(expectedResult);
      expect(createCheckoutSessionUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('getPayment', () => {
    it('should get payment by id', async () => {
      const paymentId = 'payment-123';
      const expectedResult = {
        id: paymentId,
        orderId: 'order-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'MAD',
        status: 'SUCCEEDED',
      };

      getPaymentQueryHandler.execute.mockResolvedValue(expectedResult as any);

      const result = await controller.getPayment(paymentId);

      expect(result).toEqual(expectedResult);
      expect(getPaymentQueryHandler.execute).toHaveBeenCalledWith({
        paymentId,
      });
    });
  });

  describe('createRefund', () => {
    it('should create refund', async () => {
      const paymentId = 'payment-123';
      const dto: CreateRefundRequestDto = {
        amount: 500,
        reason: 'Customer request',
      };

      const expectedResult = {
        id: 'refund-123',
        paymentId,
        amount: 500,
        currency: 'MAD',
        status: 'SUCCEEDED',
      };

      createRefundUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await controller.createRefund(paymentId, dto);

      expect(result).toEqual(expectedResult);
      expect(createRefundUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('getPaymentByOrder', () => {
    it('should get payment by order id', async () => {
      const orderId = 'order-123';

      const result = await controller.getPaymentByOrder(orderId);

      expect(result).toHaveProperty('orderId', orderId);
    });
  });

  describe('listRefunds', () => {
    it('should list refunds for payment', async () => {
      const paymentId = 'payment-123';

      const result = await controller.listRefunds(paymentId);

      expect(result).toHaveProperty('paymentId', paymentId);
      expect(result).toHaveProperty('refunds');
    });
  });
});
