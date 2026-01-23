import { Injectable } from '@nestjs/common';
import { PaymentAggregate } from '../../../domain/aggregates/payment.aggregate';

export interface ProcessPaymentSuccessCommand {
  paymentIntentId: string;
  paymentMethod: string;
  lastFourDigits?: string;
}

@Injectable()
export class ProcessPaymentSuccessUseCase {
  async execute(command: ProcessPaymentSuccessCommand): Promise<void> {
    // This would typically load payment from repository
    // For now, demonstrating the domain logic
    
    // const payment = await this.paymentRepo.findByStripePaymentIntentId(
    //   command.paymentIntentId
    // );
    
    // payment.markAsSucceeded(
    //   command.paymentIntentId,
    //   command.paymentMethod,
    //   command.lastFourDigits
    // );
    
    // await this.paymentRepo.save(payment);
    
    // Publish domain events to event bus
  }
}
