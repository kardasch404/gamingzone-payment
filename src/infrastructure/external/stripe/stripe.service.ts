import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  StripePaymentException,
  InvalidWebhookSignatureException,
  StripeRefundException,
} from './stripe.exceptions';

export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  orderId: string;
  userId: string;
  orderNumber?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionData {
  orderId: string;
  userId: string;
  currency: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private maxRetries = 3;
  private baseDelay = 1000;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('stripe.secretKey');
    if (!secretKey) {
      throw new Error('Stripe secret key is not configured');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }

  async createPaymentIntent(
    data: CreatePaymentIntentData,
  ): Promise<Stripe.PaymentIntent> {
    return this.withRetry(async () => {
      try {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(data.amount * 100),
          currency: data.currency.toLowerCase(),
          customer: data.customerId,
          metadata: {
            orderId: data.orderId,
            userId: data.userId,
            ...data.metadata,
          },
          automatic_payment_methods: {
            enabled: true,
          },
          description: data.orderNumber
            ? `Order ${data.orderNumber}`
            : undefined,
        });

        return paymentIntent;
      } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
          throw new StripePaymentException(error.message, error.code);
        }
        throw error;
      }
    });
  }

  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.withRetry(async () => {
      try {
        return await this.stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethodId,
        });
      } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
          throw new StripePaymentException(error.message, error.code);
        }
        throw error;
      }
    });
  }

  async createCheckoutSession(
    data: CheckoutSessionData,
  ): Promise<Stripe.Checkout.Session> {
    return this.withRetry(async () => {
      try {
        const session = await this.stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: data.items.map((item) => ({
            price_data: {
              currency: data.currency.toLowerCase(),
              product_data: {
                name: item.name,
                images: item.image ? [item.image] : undefined,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          metadata: {
            orderId: data.orderId,
            userId: data.userId,
          },
          success_url: `${data.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: data.cancelUrl,
          customer_email: data.customerEmail,
        });

        return session;
      } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
          throw new StripePaymentException(error.message, error.code);
        }
        throw error;
      }
    });
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string,
  ): Promise<Stripe.Refund> {
    return this.withRetry(async () => {
      try {
        const refund = await this.stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason: reason as Stripe.Refund.CreateParams.Reason,
        });

        return refund;
      } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
          throw new StripeRefundException(error.message);
        }
        throw error;
      }
    });
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.withRetry(async () => {
      try {
        return await this.stripe.paymentIntents.retrieve(paymentIntentId);
      } catch (error) {
        if (error instanceof Stripe.errors.StripeError) {
          throw new StripePaymentException(error.message, error.code);
        }
        throw error;
      }
    });
  }

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      throw new InvalidWebhookSignatureException(error.message);
    }
  }

  getClient(): Stripe {
    return this.stripe;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    attempt: number = 1,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        attempt < this.maxRetries &&
        error instanceof Stripe.errors.StripeError &&
        this.isRetryableError(error)
      ) {
        const delay = this.baseDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.withRetry(operation, attempt + 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: Stripe.errors.StripeError): boolean {
    return (
      error instanceof Stripe.errors.StripeConnectionError ||
      error instanceof Stripe.errors.StripeAPIError ||
      (error.statusCode >= 500 && error.statusCode < 600)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
