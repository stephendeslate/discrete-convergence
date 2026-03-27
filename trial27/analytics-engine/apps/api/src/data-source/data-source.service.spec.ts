import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSourceType } from '@analytics-engine/shared';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    dataSource: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    syncRun: { create: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      syncRun: { create: jest.fn(), update: jest.fn() },
    };
    prisma.syncRun.update = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  describe('create', () => {
    it('should create a data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);
      prisma.dataSource.create.mockResolvedValue({
        id: 'ds-1',
        name: 'Sales API',
        type: DataSourceType.REST_API,
      });

      const result = await service.create('tenant-1', {
        name: 'Sales API',
        type: DataSourceType.REST_API,
      });
      expect(result.name).toBe('Sales API');
    });

    it('should throw ConflictException for duplicate name', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create('tenant-1', { name: 'Existing', type: DataSourceType.REST_API }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return data source by ID', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        name: 'Sales API',
        tenantId: 'tenant-1',
      });

      const result = await service.findOne('tenant-1', 'ds-1');
      expect(result.id).toBe('ds-1');
    });

    it('should throw NotFoundException when data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('tenant-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('testConnection', () => {
    it('should return success for active data source with config', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        status: 'ACTIVE',
        configEncrypted: '{"url": "http://api.example.com"}',
        tenantId: 'tenant-1',
      });

      const result = await service.testConnection('tenant-1', 'ds-1');
      expect(result.success).toBe(true);
    });

    it('should throw BadRequestException for paused data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        status: 'PAUSED',
        tenantId: 'tenant-1',
      });

      await expect(
        service.testConnection('tenant-1', 'ds-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return failure when no config provided', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        status: 'ACTIVE',
        configEncrypted: null,
        tenantId: 'tenant-1',
      });

      const result = await service.testConnection('tenant-1', 'ds-1');
      expect(result.success).toBe(false);
    });
  });

  describe('sync', () => {
    it('should sync an active data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        status: 'ACTIVE',
        consecutiveFailures: 0,
        tenantId: 'tenant-1',
      });
      prisma.syncRun.create.mockResolvedValue({ id: 'sync-1' });
      prisma.syncRun.update.mockResolvedValue({ id: 'sync-1' });
      prisma.dataSource.update.mockResolvedValue({ id: 'ds-1' });

      const result = await service.sync('tenant-1', 'ds-1');
      expect(result.status).toBe('COMPLETED');
    });

    it('should throw BadRequestException when syncing paused data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        status: 'PAUSED',
        tenantId: 'tenant-1',
      });

      await expect(
        service.sync('tenant-1', 'ds-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when syncing error data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        status: 'ERROR',
        tenantId: 'tenant-1',
      });

      await expect(
        service.sync('tenant-1', 'ds-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
