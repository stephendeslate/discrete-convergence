// TRACED:DS-SVC-TEST — Data source service tests
import { DataSourceService } from './data-source.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    dataSource: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    syncHistory: { create: jest.Mock; update: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      dataSource: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      syncHistory: {
        create: jest.fn().mockResolvedValue({ id: 'sh-1' }),
        update: jest.fn(),
      },
    };
    service = new DataSourceService(prisma as unknown as PrismaService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.findOne('999', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('sync', () => {
    it('should sync an active postgresql source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: '1',
        type: 'postgresql',
        isActive: true,
        tenantId: 'tenant-1',
      });
      prisma.syncHistory.create.mockResolvedValue({ id: 'sh-1' });
      prisma.syncHistory.update.mockResolvedValue({ id: 'sh-1' });

      const result = await service.sync('1', 'tenant-1');
      expect(result.status).toBe('COMPLETED');
      expect(result.syncId).toBe('sh-1');
    });

    it('should reject sync for inactive source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: '1',
        type: 'postgresql',
        isActive: false,
        tenantId: 'tenant-1',
      });
      await expect(service.sync('1', 'tenant-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('testConnection', () => {
    it('should succeed for valid postgresql connection', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: '1',
        type: 'postgresql',
        connectionString: 'postgresql://localhost:5432/db',
        tenantId: 'tenant-1',
      });
      const result = await service.testConnection('1', 'tenant-1');
      expect(result.success).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should fail for invalid API URL', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: '1',
        type: 'api',
        connectionString: 'ftp://invalid',
        tenantId: 'tenant-1',
      });
      const result = await service.testConnection('1', 'tenant-1');
      expect(result.success).toBe(false);
      expect(result.message).toContain('http');
    });

    it('should fail for unsupported type', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: '1',
        type: 'unknown',
        connectionString: 'something',
        tenantId: 'tenant-1',
      });
      const result = await service.testConnection('1', 'tenant-1');
      expect(result.success).toBe(false);
    });
  });
});
