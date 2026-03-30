// TRACED:SYNC-HISTORY-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { SyncHistoryService } from './sync-history.service';
import { PrismaService } from '../infra/prisma.module';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  syncHistory: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

describe('SyncHistoryService', () => {
  let service: SyncHistoryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncHistoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<SyncHistoryService>(SyncHistoryService);
  });

  describe('findByDataSource', () => {
    it('should return paginated sync histories', async () => {
      const records = [{ id: 'sh-1', status: 'PENDING' }];
      mockPrisma.syncHistory.findMany.mockResolvedValue(records);
      mockPrisma.syncHistory.count.mockResolvedValue(1);

      const result = await service.findByDataSource('ds-1', 't-1', 1, 20);
      expect(result.data).toEqual(records);
      expect(result.meta.total).toBe(1);
    });

    it('should use default pagination', async () => {
      mockPrisma.syncHistory.findMany.mockResolvedValue([]);
      mockPrisma.syncHistory.count.mockResolvedValue(0);

      const result = await service.findByDataSource('ds-1', 't-1');
      expect(result.meta.page).toBeGreaterThanOrEqual(1);
    });
  });

  describe('findOne', () => {
    it('should return a sync history record', async () => {
      const record = { id: 'sh-1', status: 'COMPLETED' };
      mockPrisma.syncHistory.findFirst.mockResolvedValue(record);

      const result = await service.findOne('sh-1', 't-1');
      expect(result).toEqual(record);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.syncHistory.findFirst.mockResolvedValue(null);

      await expect(service.findOne('sh-999', 't-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('triggerSync', () => {
    it('should create a new sync with PENDING status', async () => {
      const created = { id: 'sh-2', status: 'PENDING', dataSourceId: 'ds-1' };
      mockPrisma.syncHistory.create.mockResolvedValue(created);

      const result = await service.triggerSync('ds-1', 't-1');
      expect(result).toEqual(created);
      expect(mockPrisma.syncHistory.create).toHaveBeenCalledWith({
        data: { dataSourceId: 'ds-1', tenantId: 't-1', status: 'PENDING' },
      });
    });
  });
});
