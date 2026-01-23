import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaService } from '../../../infrastructure/messaging/kafka/kafka.service';
import { CreateRefundUseCase } from '../../use-cases/commands/create-refund.use-case';
import { CreateRefundCommand } from '../../use-cases/commands/create-refund.command';

export interface RefundRequestedEvent {
  eventType: 'order.refund_requested';
  version: '1.0';
  timestamp: string;
  data: {
    paymentId: string;
    orderId: string;
    amount: number;
    reason: string;
  };
}

@Injectable()
export class EventConsumer implements OnModuleInit {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly configService: ConfigService,
    private readonly createRefundUseCase: CreateRefundUseCase,
  ) {}

  async onModuleInit() {
    await this.subscribeToRefundRequests();
  }

  private async subscribeToRefundRequests(): Promise<void> {
    const topic = 'gamingzone.order.refund-requests';

    await this.kafkaService.subscribe(topic, async (event: RefundRequestedEvent) => {
      await this.handleRefundRequested(event);
    });
  }

  private async handleRefundRequested(event: RefundRequestedEvent): Promise<void> {
    try {
      const command = new CreateRefundCommand(
        event.data.paymentId,
        event.data.amount,
        event.data.reason,
      );

      await this.createRefundUseCase.execute(command);
    } catch (error) {
      console.error('Failed to process refund request:', error);
      // Send to DLQ
      const dlqTopic = this.configService.get('kafka.topics.dlq');
      await this.kafkaService.publish(dlqTopic, {
        originalEvent: event,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
