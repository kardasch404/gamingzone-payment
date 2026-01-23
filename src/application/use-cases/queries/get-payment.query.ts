import { Injectable } from '@nestjs/common';
import { PaymentDTO } from '../../dto/response/payment.dto';
import { PaymentAggregate } from '../../../domain/aggregates/payment.aggregate';

export interface GetPaymentQuery {
  paymentId: string;
}

@Injectable()
export class GetPaymentQueryHandler {
  async execute(query: GetPaymentQuery): Promise<PaymentDTO | null> {
    // const payment = await this.paymentRepo.findById(query.paymentId);
    
    // if (!payment) {
    //   return null;
    // }
    
    // return PaymentDTO.fromDomain(payment);
    
    return null;
  }
}
