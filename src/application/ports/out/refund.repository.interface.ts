import { Refund } from '../../../domain/entities/refund.entity';

export interface IRefundRepository {
  create(refund: Refund): Promise<Refund>;
  findById(id: string): Promise<Refund | null>;
  findByPaymentId(paymentId: string): Promise<Refund[]>;
  update(id: string, refund: Partial<Refund>): Promise<Refund>;
}
