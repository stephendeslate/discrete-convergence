import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/infra/prisma.service';

// TRACED:AE-TEST-008 — DataSource service unit test with mocked Prisma
describe('DataSourceService', () => {
  let service: DataSourceService;

  const mockPrisma = {
    dataSource: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    syncRun: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a data source', async () => {
      const expected = {
        id: 'ds-1',
        name: 'Test API',
        type: 'REST_API',
        tenantId: 'tenant-1',
        config: null,
        fieldMappings: [],
      };
      mockPrisma.dataSource.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', {
        name: 'Test API',
        type: 'REST_API' as const,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated data sources', async () => {
      const items = [{ id: 'ds-1', name: 'Test', config: null, fieldMappings: [] }];
      mockPrisma.dataSource.findMany.mockResolvedValue(items);
      mockPrisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a data source', async () => {
      const expected = {
        id: 'ds-1',
        name: 'Test',
        tenantId: 'tenant-1',
        config: null,
        fieldMappings: [],
        syncRuns: [],
      };
      mockPrisma.dataSource.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('ds-1', 'tenant-1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      const existing = { id: 'ds-1', name: 'Old', tenantId: 'tenant-1' };
      const updated = { ...existing, name: 'New', config: null, fieldMappings: [] };
      mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
      mockPrisma.dataSource.update.mockResolvedValue(updated);

      const result = await service.update('ds-1', 'tenant-1', { name: 'New' });
      expect(result.name).toBe('New');
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      const existing = { id: 'ds-1', tenantId: 'tenant-1' };
      mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
      mockPrisma.dataSource.delete.mockResolvedValue(existing);

      await service.remove('ds-1', 'tenant-1');
      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
      });
    });
  });

  describe('sync', () => {
    it('should create and complete a sync run', async () => {
      const dataSource = { id: 'ds-1', tenantId: 'tenant-1' };
      const syncRun = { id: 'sr-1', status: 'RUNNING', dataSourceId: 'ds-1' };
      const completed = { ...syncRun, status: 'COMPLETED' };

      mockPrisma.dataSource.findFirst.mockResolvedValue(dataSource);
      mockPrisma.syncRun.create.mockResolvedValue(syncRun);
      mockPrisma.$executeRaw.mockResolvedValue(1);
      mockPrisma.syncRun.findUnique.mockResolvedValue(completed);

      const result = await service.sync('ds-1', 'tenant-1');
      expect(result).toEqual(completed);
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });

  describe('syncHistory', () => {
    it('should return paginated sync history', async () => {
      const dataSource = { id: 'ds-1', tenantId: 'tenant-1' };
      const runs = [{ id: 'sr-1', status: 'COMPLETED' }];
      mockPrisma.dataSource.findFirst.mockResolvedValue(dataSource);
      mockPrisma.syncRun.findMany.mockResolvedValue(runs);
      mockPrisma.syncRun.count.mockResolvedValue(1);

      const result = await service.syncHistory('ds-1', 'tenant-1', 1, 20);
      expect(result.items).toEqual(runs);
      expect(result.total).toBe(1);
    });
  });
});
