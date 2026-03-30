import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    tenant: { findUnique: jest.Mock };
    dataSource: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock; update: jest.Mock; delete: jest.Mock };
    dataSourceConfig: { create: jest.Mock };
    syncRun: { create: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      tenant: { findUnique: jest.fn() },
      dataSource: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn(), update: jest.fn(), delete: jest.fn() },
      dataSourceConfig: { create: jest.fn() },
      syncRun: { create: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  describe('create', () => {
    it('should create data source when under tier limit', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 't1', tier: 'FREE' });
      prisma.dataSource.count.mockResolvedValue(1);
      prisma.dataSource.create.mockResolvedValue({ id: 'ds1', name: 'Test DS' });

      const result = await service.create('t1', { name: 'Test DS', type: 'REST' as never });
      expect(result.id).toBe('ds1');
    });

    it('should reject when FREE tier limit reached', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 't1', tier: 'FREE' });
      prisma.dataSource.count.mockResolvedValue(3);

      await expect(service.create('t1', { name: 'Over limit', type: 'REST' as never }))
        .rejects.toThrow(BadRequestException);
    });

    it('should reject when PRO tier limit reached', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 't1', tier: 'PRO' });
      prisma.dataSource.count.mockResolvedValue(20);

      await expect(service.create('t1', { name: 'Over limit', type: 'CSV' as never }))
        .rejects.toThrow(BadRequestException);
    });

    it('should allow Enterprise tier unlimited data sources', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 't1', tier: 'ENTERPRISE' });
      prisma.dataSource.count.mockResolvedValue(100);
      prisma.dataSource.create.mockResolvedValue({ id: 'ds1' });

      const result = await service.create('t1', { name: 'DS', type: 'REST' as never });
      expect(result.id).toBe('ds1');
    });

    it('should throw when tenant not found', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.create('bad', { name: 'DS', type: 'REST' as never }))
        .rejects.toThrow(NotFoundException);
    });

    it('should create config with sourceHash when config provided', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 't1', tier: 'FREE' });
      prisma.dataSource.count.mockResolvedValue(0);
      prisma.dataSource.create.mockResolvedValue({ id: 'ds1' });
      prisma.dataSourceConfig.create.mockResolvedValue({ id: 'c1' });

      await service.create('t1', { name: 'DS', type: 'REST' as never, config: { url: 'http://api.com' } });
      expect(prisma.dataSourceConfig.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ sourceHash: expect.any(String) }),
      }));
    });
  });

  describe('findOne', () => {
    it('should return data source when found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1' });
      const result = await service.findOne('t1', 'ds1');
      expect(result.id).toBe('ds1');
    });

    it('should throw when not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.findOne('t1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('triggerSync', () => {
    it('should create sync run', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1' });
      prisma.syncRun.create.mockResolvedValue({ id: 'sr1', status: 'RUNNING' });

      const result = await service.triggerSync('t1', 'ds1');
      expect(result.status).toBe('RUNNING');
    });
  });
});
