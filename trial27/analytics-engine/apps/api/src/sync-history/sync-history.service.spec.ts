import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SyncHistoryService } from './sync-history.service';
import { PrismaService } from '../infra/prisma.service';

describe('SyncHistoryService', () => {
  let service: SyncHistoryService;
  let prisma: {
    dataSource: { findFirst: jest.Mock };
    syncRun: { findMany: jest.Mock; count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      dataSource: { findFirst: jest.fn() },
      syncRun: { findMany: jest.fn(), count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncHistoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SyncHistoryService>(SyncHistoryService);
  });

  describe('findByDataSource', () => {
    it('should return paginated sync runs', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 'tenant-1' });
      const mockRun = { id: 'sr-1', dataSourceId: 'ds-1', status: 'COMPLETED' };
      prisma.syncRun.findMany.mockResolvedValue([mockRun]);
      prisma.syncRun.count.mockResolvedValue(1);

      const result = await service.findByDataSource('tenant-1', 'ds-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should throw NotFoundException if data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.findByDataSource('tenant-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should pass pagination params to query', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 'tenant-1' });
      prisma.syncRun.findMany.mockResolvedValue([]);
      prisma.syncRun.count.mockResolvedValue(0);

      await service.findByDataSource('tenant-1', 'ds-1', 2, 5);

      expect(prisma.syncRun.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });
});
