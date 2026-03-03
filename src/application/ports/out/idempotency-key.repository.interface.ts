import { IdempotencyKey } from '../../../domain/entities/idempotency-key.entity';

export interface IIdempotencyKeyRepository {
  create(key: IdempotencyKey): Promise<IdempotencyKey>;
  findByKey(key: string): Promise<IdempotencyKey | null>;
  deleteExpired(): Promise<number>;
}
