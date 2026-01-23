import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IPaymentRepository } from '../../../application/ports/out/payment.repository.interface';
import { Payment } from '../../../domain/entities/payment.entity';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payment: Payment): Promise<Payment> {
    const created = await this.prisma.payment.create({
      data: {
        id: payment.id,
        orderId: payment.orderId,
        userId: payment.userId,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        stripeCustomerId: payment.stripeCustomerId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        lastFourDigits: payment.lastFourDigits,
        metadata: payment.metadata,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    return payment ? this.toDomain(payment) : null;
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({ where: { userId } });
    return payments.map(this.toDomain);
  }

  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    const updated = await this.prisma.payment.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  private toDomain(data: any): Payment {
    return new Payment(
      data.id,
      data.orderId,
      data.userId,
      data.stripePaymentIntentId,
      data.amount.toNumber(),
      data.currency,
      data.status,
      data.stripeCustomerId,
      data.paymentMethod,
      data.lastFourDigits,
      data.metadata,
      data.paidAt,
      data.failedAt,
      data.failureReason,
      data.createdAt,
      data.updatedAt,
    );
  }
}
