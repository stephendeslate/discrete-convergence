// TRACED:AE-TEST-009 — DataSource service unit tests with mocked Prisma
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSourceService } from '../data-source.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  dataSource: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  syncRun: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  $executeRaw: vi.fn(),
};

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DataSourceService(mockPrisma as never);
  });

  describe('create', () => {
    it('should create a data source', async () => {
      const expected = { id: 'ds-1', name: 'Test DS', fieldMappings: [] };
      mockPrisma.dataSource.create.mockResolvedValue(expected);

      const result = await service.create(
        {
          name: 'Test DS',
          connectorType: 'REST_API',
          configEncrypted: 'encrypted',
        },
        'tenant-1',
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('ds-1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('triggerSync', () => {
    it('should create a sync run for active data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        isActive: true,
      });
      mockPrisma.syncRun.create.mockResolvedValue({
        id: 'sr-1',
        status: 'RUNNING',
      });

      const result = await service.triggerSync('ds-1', 'tenant-1');
      expect(result.status).toBe('RUNNING');
    });

    it('should throw for paused data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        isActive: false,
        failureCount: 5,
      });

      await expect(service.triggerSync('ds-1', 'tenant-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([]);
      mockPrisma.dataSource.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('should delete data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.dataSource.delete.mockResolvedValue({ id: 'ds-1' });

      const result = await service.remove('ds-1', 'tenant-1');
      expect(result.id).toBe('ds-1');
    });
  });
});
