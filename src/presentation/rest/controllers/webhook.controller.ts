import { Controller, Post, Headers, Req, type RawBodyRequest, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from '../../../infrastructure/external/stripe/stripe.service';
import { WebhookEventRepository } from '../../../infrastructure/database/repositories/webhook-event.repository';
import { ProcessPaymentSuccessUseCase } from '../../../application/use-cases/commands/process-payment-success.use-case';
import { ProcessPaymentFailureUseCase } from '../../../application/use-cases/commands/process-payment-failure.use-case';
import { WebhookEvent } from '../../../domain/entities/webhook-event.entity';
import { generateUuidV7 } from '../../../shared/utils/uuid.util';
import type { Request } from 'express';
import Stripe from 'stripe';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly webhookEventRepo: WebhookEventRepository,
    private readonly processPaymentSuccessUseCase: ProcessPaymentSuccessUseCase,
    private readonly processPaymentFailureUseCase: ProcessPaymentFailureUseCase,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');

    if (!webhookSecret || !request.rawBody) {
      throw new BadRequestException('Invalid webhook configuration');
    }

    let event: Stripe.Event;

    try {
      event = this.stripeService.verifyWebhookSignature(
        request.rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      throw new BadRequestException('Invalid signature');
    }

    const webhookEvent = new WebhookEvent(
      generateUuidV7(),
      event.id,
      event.type,
      event.data as any,
      false,
    );

    await this.webhookEventRepo.create(webhookEvent);

    const alreadyProcessed = await this.webhookEventRepo.findByStripeEventId(
      event.id,
    );

    if (alreadyProcessed?.processed) {
      return { received: true };
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event);
          break;

        case 'charge.refunded':
          await this.handleRefund(event);
          break;

        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      await this.webhookEventRepo.markAsProcessed(webhookEvent.id);
    } catch (error) {
      await this.webhookEventRepo.markAsProcessed(
        webhookEvent.id,
        error.message,
      );
      throw error;
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentMethod = (paymentIntent as any).charges?.data[0]?.payment_method_details;

    await this.processPaymentSuccessUseCase.execute({
      paymentIntentId: paymentIntent.id,
      paymentMethod: paymentMethod?.type || 'unknown',
      lastFourDigits: paymentMethod?.card?.last4,
    });
  }

  private async handlePaymentFailed(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    await this.processPaymentFailureUseCase.execute({
      paymentIntentId: paymentIntent.id,
      reason: paymentIntent.last_payment_error?.message || 'Unknown error',
    });
  }

  private async handleRefund(event: Stripe.Event): Promise<void> {
    const charge = event.data.object as Stripe.Charge;
    console.log('Refund processed:', charge.id);
  }

  private async handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Checkout completed:', session.id);
  }
}
