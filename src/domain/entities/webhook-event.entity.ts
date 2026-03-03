export class WebhookEvent {
  constructor(
    public readonly id: string,
    public readonly stripeEventId: string,
    public readonly eventType: string,
    public readonly payload: Record<string, any>,
    public readonly processed: boolean,
    public readonly paymentId?: string,
    public readonly processingError?: string,
    public readonly receivedAt?: Date,
    public readonly processedAt?: Date,
  ) {}
}
