import { Payment } from '../../../domain/entities/payment.entity';

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByUserId(userId: string): Promise<Payment[]>;
  update(id: string, payment: Partial<Payment>): Promise<Payment>;
}
