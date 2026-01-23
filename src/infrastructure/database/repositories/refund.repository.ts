import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IRefundRepository } from '../../../application/ports/out/refund.repository.interface';
import { Refund } from '../../../domain/entities/refund.entity';

@Injectable()
export class RefundRepository implements IRefundRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(refund: Refund): Promise<Refund> {
    const created = await this.prisma.refund.create({
      data: {
        id: refund.id,
        paymentId: refund.paymentId,
        stripeRefundId: refund.stripeRefundId,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        initiatedBy: refund.initiatedBy,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Refund | null> {
    const refund = await this.prisma.refund.findUnique({ where: { id } });
    return refund ? this.toDomain(refund) : null;
  }

  async findByPaymentId(paymentId: string): Promise<Refund[]> {
    const refunds = await this.prisma.refund.findMany({ where: { paymentId } });
    return refunds.map(this.toDomain);
  }

  async update(id: string, data: Partial<Refund>): Promise<Refund> {
    const updated = await this.prisma.refund.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  private toDomain(data: any): Refund {
    return new Refund(
      data.id,
      data.paymentId,
      data.stripeRefundId,
      data.amount.toNumber(),
      data.currency,
      data.status,
      data.reason,
      data.processedAt,
      data.failedAt,
      data.failureReason,
      data.initiatedBy,
      data.createdAt,
      data.updatedAt,
    );
  }
}
