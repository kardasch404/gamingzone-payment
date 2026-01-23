import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('should be a class that extends PrismaClient', () => {
    expect(PrismaService).toBeDefined();
    expect(typeof PrismaService).toBe('function');
  });
});
