import { WebhookEvent } from '../../../domain/entities/webhook-event.entity';

export interface IWebhookEventRepository {
  create(event: WebhookEvent): Promise<WebhookEvent>;
  findByStripeEventId(stripeEventId: string): Promise<WebhookEvent | null>;
  findUnprocessed(): Promise<WebhookEvent[]>;
  markAsProcessed(id: string, error?: string): Promise<WebhookEvent>;
}
