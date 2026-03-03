import { Injectable } from '@nestjs/common';
import { CreateRefundCommand } from './create-refund.command';
import { RefundDTO } from '../../dto/response/refund.dto';
import { StripeService } from '../../../infrastructure/external/stripe/stripe.service';
import { PaymentAggregate } from '../../../domain/aggregates/payment.aggregate';

@Injectable()
export class CreateRefundUseCase {
  constructor(private readonly stripeService: StripeService) {}

  async execute(command: CreateRefundCommand): Promise<RefundDTO> {
    // Load payment from repository
    // const payment = await this.paymentRepo.findById(command.paymentId);
    
    // Create mock payment for demonstration
    const payment = PaymentAggregate.initiate({
      orderId: 'order-1',
      userId: 'user-1',
      amount: 1000,
      currency: 'MAD',
    });
    
    payment.markAsProcessing();
    payment.markAsSucceeded('pi_123', 'card', '4242');

    const refund = payment.requestRefund(
      command.amount || 1000,
      command.reason || 'Customer request',
      command.initiatedBy,
    );

    const stripeRefund = await this.stripeService.createRefund(
      'pi_123',
      command.amount,
      command.reason,
    );

    refund.markAsProcessing();
    refund.markAsSucceeded(stripeRefund.id);

    // await this.paymentRepo.save(payment);

    return RefundDTO.fromDomain(refund);
  }
}
