import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IIdempotencyKeyRepository } from '../../../application/ports/out/idempotency-key.repository.interface';
import { IdempotencyKey } from '../../../domain/entities/idempotency-key.entity';

@Injectable()
export class IdempotencyKeyRepository implements IIdempotencyKeyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(key: IdempotencyKey): Promise<IdempotencyKey> {
    const created = await this.prisma.idempotencyKey.create({
      data: {
        id: key.id,
        key: key.key,
        requestHash: key.requestHash,
        response: key.response,
        expiresAt: key.expiresAt,
      },
    });
    return this.toDomain(created);
  }

  async findByKey(key: string): Promise<IdempotencyKey | null> {
    const found = await this.prisma.idempotencyKey.findUnique({
      where: { key },
    });
    return found ? this.toDomain(found) : null;
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  private toDomain(data: any): IdempotencyKey {
    return new IdempotencyKey(
      data.id,
      data.key,
      data.requestHash,
      data.expiresAt,
      data.response,
      data.createdAt,
    );
  }
}
