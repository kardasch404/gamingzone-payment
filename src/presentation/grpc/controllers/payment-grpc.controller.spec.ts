import { Test, TestingModule } from '@nestjs/testing';
import { PaymentGrpcController } from './payment-grpc.controller';

describe('PaymentGrpcController', () => {
  let controller: PaymentGrpcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentGrpcController],
    }).compile();

    controller = module.get<PaymentGrpcController>(PaymentGrpcController);
  });

  describe('getPayment', () => {
    it('should return payment by id', async () => {
      const request = { paymentId: 'payment-123' };

      const result = await controller.getPayment(request);

      expect(result).toHaveProperty('id', request.paymentId);
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('amount');
    });
  });

  describe('getPaymentByOrder', () => {
    it('should return payment by order id', async () => {
      const request = { orderId: 'order-123' };

      const result = await controller.getPaymentByOrder(request);

      expect(result).toHaveProperty('orderId', request.orderId);
      expect(result).toHaveProperty('status');
    });
  });

  describe('validatePayment', () => {
    it('should validate payment', async () => {
      const request = { orderId: 'order-123' };

      const result = await controller.validatePayment(request);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('status');
      expect(result.valid).toBe(true);
    });
  });
});
