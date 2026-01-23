import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IWebhookEventRepository } from '../../../application/ports/out/webhook-event.repository.interface';
import { WebhookEvent } from '../../../domain/entities/webhook-event.entity';

@Injectable()
export class WebhookEventRepository implements IWebhookEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(event: WebhookEvent): Promise<WebhookEvent> {
    const created = await this.prisma.webhookEvent.create({
      data: {
        id: event.id,
        stripeEventId: event.stripeEventId,
        eventType: event.eventType,
        payload: event.payload,
        processed: event.processed,
        paymentId: event.paymentId,
      },
    });
    return this.toDomain(created);
  }

  async findByStripeEventId(stripeEventId: string): Promise<WebhookEvent | null> {
    const event = await this.prisma.webhookEvent.findUnique({
      where: { stripeEventId },
    });
    return event ? this.toDomain(event) : null;
  }

  async findUnprocessed(): Promise<WebhookEvent[]> {
    const events = await this.prisma.webhookEvent.findMany({
      where: { processed: false },
      orderBy: { receivedAt: 'asc' },
    });
    return events.map(this.toDomain);
  }

  async markAsProcessed(id: string, error?: string): Promise<WebhookEvent> {
    const updated = await this.prisma.webhookEvent.update({
      where: { id },
      data: {
        processed: true,
        processedAt: new Date(),
        processingError: error,
      },
    });
    return this.toDomain(updated);
  }

  private toDomain(data: any): WebhookEvent {
    return new WebhookEvent(
      data.id,
      data.stripeEventId,
      data.eventType,
      data.payload,
      data.processed,
      data.paymentId,
      data.processingError,
      data.receivedAt,
      data.processedAt,
    );
  }
}
