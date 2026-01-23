import { Controller, Post, Headers, Req, type RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from '../../../infrastructure/external/stripe/stripe.service';
import type { Request } from 'express';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    const stripe = this.stripeService.getClient();

    if (!webhookSecret || !request.rawBody) {
      return { error: 'Invalid webhook configuration' };
    }

    try {
      const event = stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        webhookSecret,
      );

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          // Handle successful payment
          break;
        case 'payment_intent.payment_failed':
          // Handle failed payment
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return { error: 'Webhook signature verification failed' };
    }
  }
}
