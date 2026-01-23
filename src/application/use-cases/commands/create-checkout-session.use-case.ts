import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateCheckoutSessionCommand } from '../commands/create-checkout-session.command';
import { CheckoutSessionDTO } from '../../dto/response/checkout-session.dto';
import { StripeService } from '../../../infrastructure/external/stripe/stripe.service';
import { IdempotencyService } from '../../services/idempotency.service';
import { PaymentAggregate } from '../../../domain/aggregates/payment.aggregate';
import { generateUuidV7 } from '../../../shared/utils/uuid.util';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    private readonly stripeService: StripeService,
    private readonly idempotencyService: IdempotencyService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    command: CreateCheckoutSessionCommand,
  ): Promise<CheckoutSessionDTO> {
    const idempotencyKey = command.idempotencyKey || generateUuidV7();
    const cached = await this.idempotencyService.get<CheckoutSessionDTO>(
      idempotencyKey,
    );

    if (cached) {
      return cached;
    }

    const payment = PaymentAggregate.initiate({
      orderId: command.orderId,
      userId: command.userId,
      amount: 1000,
      currency: 'MAD',
    });

    const session = await this.stripeService.createCheckoutSession({
      orderId: command.orderId,
      userId: command.userId,
      currency: 'MAD',
      items: [
        {
          name: 'Order Payment',
          price: 1000,
          quantity: 1,
        },
      ],
      customerEmail: command.email,
      successUrl: this.configService.get('stripe.successUrl'),
      cancelUrl: this.configService.get('stripe.cancelUrl'),
    });

    const response = new CheckoutSessionDTO(
      session.id,
      session.url,
      payment.id,
    );

    await this.idempotencyService.set(idempotencyKey, response, 86400);

    return response;
  }
}
