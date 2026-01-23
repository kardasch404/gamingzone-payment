import { Injectable } from '@nestjs/common';
import { IdempotencyKeyRepository } from '../../infrastructure/database/repositories/idempotency-key.repository';
import { IdempotencyKey } from '../../domain/entities/idempotency-key.entity';
import { generateUuidV7 } from '../../shared/utils/uuid.util';
import * as crypto from 'crypto';

@Injectable()
export class IdempotencyService {
  constructor(
    private readonly idempotencyKeyRepo: IdempotencyKeyRepository,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const idempotencyKey = await this.idempotencyKeyRepo.findByKey(key);
    
    if (!idempotencyKey) {
      return null;
    }

    if (new Date() > idempotencyKey.expiresAt) {
      return null;
    }

    return idempotencyKey.response as T;
  }

  async set<T>(
    key: string,
    response: T,
    ttlSeconds: number = 86400,
  ): Promise<void> {
    const requestHash = this.hashRequest(response);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const idempotencyKey = new IdempotencyKey(
      generateUuidV7(),
      key,
      requestHash,
      expiresAt,
      response as any,
      new Date(),
    );

    await this.idempotencyKeyRepo.create(idempotencyKey);
  }

  private hashRequest(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}
