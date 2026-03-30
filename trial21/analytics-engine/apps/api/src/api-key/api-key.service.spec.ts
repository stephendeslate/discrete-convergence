import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyService } from './api-key.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let prisma: {
    apiKey: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      apiKey: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
  });

  describe('create', () => {
    it('should create API key and return raw key', async () => {
      prisma.apiKey.create.mockResolvedValue({
        id: 'ak1', name: 'Test Key', keyHash: 'hash', prefix: 'ae_xxxxx',
        expiresAt: null, createdAt: new Date(),
      });

      const result = await service.create('t1', { name: 'Test Key' });
      expect(result.key).toMatch(/^ae_/);
      expect(result.name).toBe('Test Key');
      expect(prisma.apiKey.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ tenantId: 't1', keyHash: expect.any(String) }),
      }));
    });
  });

  describe('findAll', () => {
    it('should return non-revoked keys', async () => {
      prisma.apiKey.findMany.mockResolvedValue([{ id: 'ak1' }]);
      const result = await service.findAll('t1');
      expect(result).toHaveLength(1);
    });
  });

  describe('revoke', () => {
    it('should revoke existing key', async () => {
      prisma.apiKey.findFirst.mockResolvedValue({ id: 'ak1' });
      prisma.apiKey.update.mockResolvedValue({ id: 'ak1' });
      await service.revoke('t1', 'ak1');
      expect(prisma.apiKey.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      }));
    });

    it('should throw when key not found', async () => {
      prisma.apiKey.findFirst.mockResolvedValue(null);
      await expect(service.revoke('t1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });
});
