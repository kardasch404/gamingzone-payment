import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebhookEventRepository } from '../../infrastructure/database/repositories/webhook-event.repository';

@Injectable()
export class WebhookRetryService {
  constructor(
    private readonly webhookEventRepo: WebhookEventRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedWebhooks(): Promise<void> {
    const failedEvents = await this.webhookEventRepo.findUnprocessed();

    for (const event of failedEvents) {
      try {
        // Reprocess event logic would go here
        console.log(`Retrying webhook event: ${event.stripeEventId}`);
        
        // await this.processWebhookEvent(event);
        
        // await this.webhookEventRepo.markAsProcessed(event.id);
      } catch (error) {
        console.error(`Failed to retry webhook ${event.id}:`, error.message);
      }
    }
  }
}
