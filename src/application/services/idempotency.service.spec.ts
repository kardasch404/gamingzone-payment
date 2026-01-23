import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyService } from './idempotency.service';
import { IdempotencyKeyRepository } from '../../infrastructure/database/repositories/idempotency-key.repository';
import { IdempotencyKey } from '../../domain/entities/idempotency-key.entity';

describe('IdempotencyService', () => {
  let service: IdempotencyService;
  let repository: jest.Mocked<IdempotencyKeyRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyService,
        {
          provide: IdempotencyKeyRepository,
          useValue: {
            findByKey: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IdempotencyService>(IdempotencyService);
    repository = module.get(IdempotencyKeyRepository);
  });

  describe('get', () => {
    it('should return cached response if not expired', async () => {
      const response = { data: 'test' };
      const idempotencyKey = new IdempotencyKey(
        '1',
        'key-123',
        'hash',
        new Date(Date.now() + 10000),
        response,
        new Date(),
      );

      repository.findByKey.mockResolvedValue(idempotencyKey);

      const result = await service.get('key-123');

      expect(result).toEqual(response);
    });

    it('should return null if expired', async () => {
      const idempotencyKey = new IdempotencyKey(
        '1',
        'key-123',
        'hash',
        new Date(Date.now() - 10000),
        { data: 'test' },
        new Date(),
      );

      repository.findByKey.mockResolvedValue(idempotencyKey);

      const result = await service.get('key-123');

      expect(result).toBeNull();
    });

    it('should return null if not found', async () => {
      repository.findByKey.mockResolvedValue(null);

      const result = await service.get('key-123');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store response with TTL', async () => {
      const response = { data: 'test' };

      await service.set('key-123', response, 3600);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'key-123',
          response,
        }),
      );
    });
  });
});
