import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventPublisher } from './event-publisher.service';
import { KafkaService } from '../../../infrastructure/messaging/kafka/kafka.service';

describe('EventPublisher', () => {
  let service: EventPublisher;
  let kafkaService: jest.Mocked<KafkaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventPublisher,
        {
          provide: KafkaService,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'kafka.topics.paymentEvents') return 'payment-events';
              if (key === 'kafka.topics.refundEvents') return 'refund-events';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EventPublisher>(EventPublisher);
    kafkaService = module.get(KafkaService);
  });

  describe('publishPaymentSucceeded', () => {
    it('should publish payment succeeded event', async () => {
      const event = {
        data: {
          paymentId: 'payment-123',
          orderId: 'order-123',
          userId: 'user-123',
          amount: 1000,
          currency: 'MAD',
          paymentIntentId: 'pi_123',
          paymentMethod: 'card',
        },
      };

      await service.publishPaymentSucceeded(event);

      expect(kafkaService.publish).toHaveBeenCalledWith(
        'payment-events',
        expect.objectContaining({
          eventType: 'payment.succeeded',
          version: '1.0',
          data: event.data,
        }),
      );
    });
  });

  describe('publishPaymentFailed', () => {
    it('should publish payment failed event', async () => {
      const event = {
        data: {
          paymentId: 'payment-123',
          orderId: 'order-123',
          reason: 'Card declined',
        },
      };

      await service.publishPaymentFailed(event);

      expect(kafkaService.publish).toHaveBeenCalledWith(
        'payment-events',
        expect.objectContaining({
          eventType: 'payment.failed',
          version: '1.0',
          data: event.data,
        }),
      );
    });
  });

  describe('publishRefundProcessed', () => {
    it('should publish refund processed event', async () => {
      const event = {
        data: {
          refundId: 'refund-123',
          paymentId: 'payment-123',
          orderId: 'order-123',
          amount: 500,
          reason: 'Customer request',
        },
      };

      await service.publishRefundProcessed(event);

      expect(kafkaService.publish).toHaveBeenCalledWith(
        'refund-events',
        expect.objectContaining({
          eventType: 'payment.refund_processed',
          version: '1.0',
          data: event.data,
        }),
      );
    });
  });
});
