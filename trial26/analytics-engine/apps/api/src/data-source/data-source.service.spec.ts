import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';

// TRACED: AE-DS-001 — Create data source
// TRACED: AE-DS-006 — Test connection
// TRACED: AE-DS-007 — Sync data source
// TRACED: AE-EDGE-004 — Duplicate data source name
// TRACED: AE-EDGE-005 — Sync on paused data source

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      dataSource: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      syncHistory: { create: jest.fn(), update: jest.fn() },
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
    it('should create a data source with valid data', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-1', name: 'API Source' });

      const result = await service.create('tenant-1', {
        name: 'API Source',
        type: 'REST_API' as never,
        connectionConfig: '{"url":"https://example.com"}',
      });
      expect(result.name).toBe('API Source');
    });

    it('should throw ConflictException for duplicate data source name', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create('tenant-1', {
          name: 'Existing',
          type: 'REST_API' as never,
          connectionConfig: '{}',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should list data sources with pagination', async () => {
      prisma.dataSource.findMany.mockResolvedValue([{ id: 'ds-1' }]);
      prisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return data source when found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', name: 'Test' });
      const result = await service.findOne('tenant-1', 'ds-1');
      expect(result.name).toBe('Test');
    });

    it('should throw NotFoundException when data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.findOne('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      prisma.dataSource.update.mockResolvedValue({ id: 'ds-1', name: 'Updated' });
      const result = await service.update('tenant-1', 'ds-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      prisma.dataSource.delete.mockResolvedValue({ id: 'ds-1' });
      const result = await service.remove('tenant-1', 'ds-1');
      expect(result.id).toBe('ds-1');
    });
  });

  describe('testConnection', () => {
    it('should test connection for REST API data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', type: 'REST_API', status: 'ACTIVE',
      });

      const result = await service.testConnection('tenant-1', 'ds-1');
      expect(result.success).toBe(true);
    });

    it('should throw BadRequestException for error state data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', type: 'REST_API', status: 'ERROR',
      });

      await expect(service.testConnection('tenant-1', 'ds-1')).rejects.toThrow(BadRequestException);
    });

    it('should test connection for POSTGRESQL data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', type: 'POSTGRESQL', status: 'ACTIVE',
      });
      const result = await service.testConnection('tenant-1', 'ds-1');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Database');
    });

    it('should test connection for CSV data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', type: 'CSV', status: 'ACTIVE',
      });
      const result = await service.testConnection('tenant-1', 'ds-1');
      expect(result.success).toBe(true);
      expect(result.message).toContain('CSV');
    });

    it('should test connection for WEBHOOK data source (fallback)', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', type: 'WEBHOOK', status: 'ACTIVE',
      });
      const result = await service.testConnection('tenant-1', 'ds-1');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Webhook');
    });
  });

  describe('sync', () => {
    it('should throw BadRequestException when syncing paused data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', status: 'PAUSED', failureCount: 0,
      });

      await expect(service.sync('tenant-1', 'ds-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when failure threshold exceeded', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', status: 'ACTIVE', failureCount: 5,
      });

      await expect(service.sync('tenant-1', 'ds-1')).rejects.toThrow(BadRequestException);
    });

    it('should sync successfully for active data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1', tenantId: 'tenant-1', status: 'ACTIVE', failureCount: 0,
      });
      prisma.syncHistory.create.mockResolvedValue({ id: 'sync-1' });
      prisma.syncHistory.update.mockResolvedValue({ id: 'sync-1', status: 'COMPLETED' });
      prisma.dataSource.update.mockResolvedValue({});

      const result = await service.sync('tenant-1', 'ds-1');
      expect(result.status).toBe('COMPLETED');
    });
  });
});
