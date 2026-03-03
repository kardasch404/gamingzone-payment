import { Injectable } from '@nestjs/common';

export interface ProcessPaymentFailureCommand {
  paymentIntentId: string;
  reason: string;
}

@Injectable()
export class ProcessPaymentFailureUseCase {
  async execute(command: ProcessPaymentFailureCommand): Promise<void> {
    // const payment = await this.paymentRepo.findByStripePaymentIntentId(
    //   command.paymentIntentId
    // );
    
    // payment.markAsFailed(command.reason);
    
    // await this.paymentRepo.save(payment);
    
    // Publish domain events
  }
}
