// TRACED:SYNC-SVC-TEST — Sync history service tests
import { SyncHistoryService } from './sync-history.service';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

describe('SyncHistoryService', () => {
  let service: SyncHistoryService;
  let prisma: {
    syncHistory: { findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      syncHistory: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    service = new SyncHistoryService(prisma as unknown as PrismaService);
  });

  it('should return paginated sync histories', async () => {
    const result = await service.findAll('tenant-1', 1, 10);
    expect(result.data).toEqual([]);
    expect(result.meta).toBeDefined();
    expect(result.meta.total).toBe(0);
  });

  it('should throw NotFoundException when not found', async () => {
    prisma.syncHistory.findFirst.mockResolvedValue(null);
    await expect(service.findOne('999', 'tenant-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.syncHistory.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should return a sync history by id', async () => {
    prisma.syncHistory.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED' });
    const result = await service.findOne('1', 'tenant-1');
    expect(result.status).toBe('COMPLETED');
    expect(result.id).toBe('1');
  });
});
