import { SyncHistoryService } from './sync-history.service';
import { NotFoundException } from '@nestjs/common';

describe('SyncHistoryService', () => {
  let service: SyncHistoryService;
  let mockPrisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(() => {
    mockPrisma = {
      dataSource: {
        findFirst: jest.fn().mockResolvedValue({ id: 'ds-1', tenantId: 'tenant-1' }),
      },
      syncHistory: {
        findMany: jest.fn().mockResolvedValue([{ id: 'sh-1', status: 'COMPLETED' }]),
        count: jest.fn().mockResolvedValue(1),
        findFirst: jest.fn().mockResolvedValue({
          id: 'sh-1',
          status: 'COMPLETED',
          dataSource: { tenantId: 'tenant-1' },
        }),
      },
    };
    service = new SyncHistoryService(mockPrisma as never);
  });

  it('should list sync history for a data source', async () => {
    const result = await service.findAllForDataSource('tenant-1', 'ds-1', 1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ds-1', tenantId: 'tenant-1' } }),
    );
  });

  it('should throw NotFoundException when data source not found for listing', async () => {
    mockPrisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.findAllForDataSource('tenant-1', 'ds-missing'))
      .rejects.toThrow(NotFoundException);
  });

  it('should get a single sync run', async () => {
    const result = await service.findOne('tenant-1', 'sh-1');
    expect(result.id).toBe('sh-1');
    expect(result.status).toBe('COMPLETED');
  });

  it('should throw NotFoundException when sync run not found', async () => {
    mockPrisma.syncHistory.findFirst.mockResolvedValue(null);
    await expect(service.findOne('tenant-1', 'sh-missing'))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when sync run belongs to different tenant', async () => {
    mockPrisma.syncHistory.findFirst.mockResolvedValue({
      id: 'sh-1',
      dataSource: { tenantId: 'other-tenant' },
    });
    await expect(service.findOne('tenant-1', 'sh-1'))
      .rejects.toThrow(NotFoundException);
  });
});
