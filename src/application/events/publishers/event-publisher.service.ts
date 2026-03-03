import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaService } from '../../../infrastructure/messaging/kafka/kafka.service';

export interface PaymentSucceededEvent {
  eventType: 'payment.succeeded';
  version: '1.0';
  timestamp: string;
  data: {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    paymentIntentId: string;
    paymentMethod: string;
  };
}

export interface PaymentFailedEvent {
  eventType: 'payment.failed';
  version: '1.0';
  timestamp: string;
  data: {
    paymentId: string;
    orderId: string;
    reason: string;
  };
}

export interface RefundProcessedEvent {
  eventType: 'payment.refund_processed';
  version: '1.0';
  timestamp: string;
  data: {
    refundId: string;
    paymentId: string;
    orderId: string;
    amount: number;
    reason: string;
  };
}

@Injectable()
export class EventPublisher {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly configService: ConfigService,
  ) {}

  async publishPaymentSucceeded(event: Omit<PaymentSucceededEvent, 'eventType' | 'version' | 'timestamp'>): Promise<void> {
    const fullEvent: PaymentSucceededEvent = {
      eventType: 'payment.succeeded',
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...event,
    };

    const topic = this.configService.get('kafka.topics.paymentEvents');
    await this.kafkaService.publish(topic, fullEvent);
  }

  async publishPaymentFailed(event: Omit<PaymentFailedEvent, 'eventType' | 'version' | 'timestamp'>): Promise<void> {
    const fullEvent: PaymentFailedEvent = {
      eventType: 'payment.failed',
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...event,
    };

    const topic = this.configService.get('kafka.topics.paymentEvents');
    await this.kafkaService.publish(topic, fullEvent);
  }

  async publishRefundProcessed(event: Omit<RefundProcessedEvent, 'eventType' | 'version' | 'timestamp'>): Promise<void> {
    const fullEvent: RefundProcessedEvent = {
      eventType: 'payment.refund_processed',
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...event,
    };

    const topic = this.configService.get('kafka.topics.refundEvents');
    await this.kafkaService.publish(topic, fullEvent);
  }
}
