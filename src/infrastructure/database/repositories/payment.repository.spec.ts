import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Payment } from '../../../domain/entities/payment.entity';

describe('PaymentRepository', () => {
  let repository: PaymentRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PaymentRepository>(PaymentRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a payment', async () => {
      const payment = new Payment('1', 'order-1', 'user-1', 'pi_123', 1000, 'mad', 'PENDING');
      const mockCreated = {
        id: '1',
        orderId: 'order-1',
        userId: 'user-1',
        stripePaymentIntentId: 'pi_123',
        amount: { toNumber: () => 1000 },
        currency: 'mad',
        status: 'PENDING',
        stripeCustomerId: null,
        paymentMethod: null,
        lastFourDigits: null,
        metadata: null,
        paidAt: null,
        failedAt: null,
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.payment.create.mockResolvedValue(mockCreated);

      const result = await repository.create(payment);

      expect(result).toBeInstanceOf(Payment);
      expect(result.id).toBe('1');
    });
  });

  describe('findById', () => {
    it('should find payment by id', async () => {
      const mockPayment = {
        id: '1',
        orderId: 'order-1',
        userId: 'user-1',
        stripePaymentIntentId: 'pi_123',
        amount: { toNumber: () => 1000 },
        currency: 'mad',
        status: 'PENDING',
        stripeCustomerId: null,
        paymentMethod: null,
        lastFourDigits: null,
        metadata: null,
        paidAt: null,
        failedAt: null,
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await repository.findById('1');

      expect(result).toBeInstanceOf(Payment);
      expect(result.id).toBe('1');
    });

    it('should return null if payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find payments by user id', async () => {
      const mockPayments = [
        {
          id: '1',
          orderId: 'order-1',
          userId: 'user-1',
          stripePaymentIntentId: 'pi_123',
          amount: { toNumber: () => 1000 },
          currency: 'mad',
          status: 'PENDING',
          stripeCustomerId: null,
          paymentMethod: null,
          lastFourDigits: null,
          metadata: null,
          paidAt: null,
          failedAt: null,
          failureReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);

      const result = await repository.findByUserId('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Payment);
    });
  });

  describe('update', () => {
    it('should update payment', async () => {
      const mockUpdated = {
        id: '1',
        orderId: 'order-1',
        userId: 'user-1',
        stripePaymentIntentId: 'pi_123',
        amount: { toNumber: () => 1000 },
        currency: 'mad',
        status: 'SUCCEEDED',
        stripeCustomerId: null,
        paymentMethod: null,
        lastFourDigits: null,
        metadata: null,
        paidAt: new Date(),
        failedAt: null,
        failureReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.payment.update.mockResolvedValue(mockUpdated);

      const result = await repository.update('1', { status: 'SUCCEEDED' });

      expect(result).toBeInstanceOf(Payment);
      expect(result.status).toBe('SUCCEEDED');
    });
  });
});
