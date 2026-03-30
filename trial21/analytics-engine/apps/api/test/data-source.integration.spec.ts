import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceController } from '../src/data-source/data-source.controller';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string; tenantId: string; role: string };
}

function mockReq(overrides: Partial<AuthenticatedRequest['user']> = {}): AuthenticatedRequest {
  return {
    user: {
      userId: 'user-1',
      tenantId: 'tenant-1',
      role: 'USER',
      ...overrides,
    },
  } as AuthenticatedRequest;
}

describe('DataSource Integration (Controller → Service → Prisma)', () => {
  let controller: DataSourceController;
  let prisma: {
    tenant: { findUnique: jest.Mock };
    dataSource: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    dataSourceConfig: { create: jest.Mock };
    syncRun: { create: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      tenant: { findUnique: jest.fn() },
      dataSource: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      dataSourceConfig: { create: jest.fn() },
      syncRun: { create: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  describe('create data source', () => {
    it('should create a data source when under FREE tier limit', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1', tier: 'FREE' });
      prisma.dataSource.count.mockResolvedValue(1);
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-1', name: 'API Source', type: 'REST' });

      const result = await controller.create(mockReq(), { name: 'API Source', type: 'REST' as never });

      expect(result.id).toBe('ds-1');
      expect(prisma.dataSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'API Source', tenantId: 'tenant-1' }),
        }),
      );
    });

    it('should reject when FREE tier limit (3) is reached', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1', tier: 'FREE' });
      prisma.dataSource.count.mockResolvedValue(3);

      await expect(
        controller.create(mockReq(), { name: 'Over Limit', type: 'REST' as never }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when PRO tier limit (20) is reached', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1', tier: 'PRO' });
      prisma.dataSource.count.mockResolvedValue(20);

      await expect(
        controller.create(mockReq(), { name: 'Over Limit', type: 'CSV' as never }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow ENTERPRISE tier unlimited data sources', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1', tier: 'ENTERPRISE' });
      prisma.dataSource.count.mockResolvedValue(500);
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-500' });

      const result = await controller.create(mockReq(), { name: 'Another DS', type: 'REST' as never });
      expect(result.id).toBe('ds-500');
    });

    it('should create config with sourceHash when config is provided', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1', tier: 'FREE' });
      prisma.dataSource.count.mockResolvedValue(0);
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-1' });
      prisma.dataSourceConfig.create.mockResolvedValue({ id: 'cfg-1' });

      await controller.create(mockReq(), {
        name: 'Configured DS',
        type: 'REST' as never,
        config: { url: 'https://api.example.com', headers: {} },
      });

      expect(prisma.dataSourceConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dataSourceId: 'ds-1',
            sourceHash: expect.any(String),
          }),
        }),
      );
    });

    it('should throw NotFoundException when tenant does not exist', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        controller.create(mockReq(), { name: 'DS', type: 'REST' as never }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll with pagination', () => {
    it('should return paginated data sources', async () => {
      prisma.dataSource.findMany.mockResolvedValue([
        { id: 'ds-1', name: 'Source A' },
        { id: 'ds-2', name: 'Source B' },
      ]);
      prisma.dataSource.count.mockResolvedValue(2);

      const result = await controller.findAll(mockReq(), { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should return empty results for tenant with no data sources', async () => {
      prisma.dataSource.findMany.mockResolvedValue([]);
      prisma.dataSource.count.mockResolvedValue(0);

      const result = await controller.findAll(mockReq(), { page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return data source when found with tenant scoping', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 'tenant-1', name: 'My DS' });

      const result = await controller.findOne(mockReq(), 'ds-1');

      expect(result.id).toBe('ds-1');
      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds-1', tenantId: 'tenant-1' } }),
      );
    });

    it('should throw NotFoundException when data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(controller.findOne(mockReq(), 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update data source name', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 'tenant-1' });
      prisma.dataSource.update.mockResolvedValue({ id: 'ds-1', name: 'Renamed DS' });

      const result = await controller.update(mockReq(), 'ds-1', { name: 'Renamed DS' });
      expect(result.name).toBe('Renamed DS');
    });

    it('should throw NotFoundException when updating nonexistent data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        controller.update(mockReq(), 'bad-id', { name: 'Nope' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 'tenant-1' });
      prisma.dataSource.delete.mockResolvedValue({ id: 'ds-1' });

      await controller.remove(mockReq(), 'ds-1');
      expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
    });

    it('should throw NotFoundException when deleting nonexistent data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(controller.remove(mockReq(), 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('triggerSync', () => {
    it('should create a sync run for an existing data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 'tenant-1' });
      prisma.syncRun.create.mockResolvedValue({ id: 'sync-1', status: 'RUNNING', dataSourceId: 'ds-1' });

      const result = await controller.triggerSync(mockReq(), 'ds-1');

      expect(result.status).toBe('RUNNING');
      expect(prisma.syncRun.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ dataSourceId: 'ds-1', status: 'RUNNING' }),
        }),
      );
    });

    it('should throw NotFoundException when triggering sync for nonexistent data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(controller.triggerSync(mockReq(), 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('syncHistory', () => {
    it('should return sync history for a data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 'tenant-1' });
      prisma.syncRun.findMany.mockResolvedValue([
        { id: 'sync-1', status: 'COMPLETED' },
        { id: 'sync-2', status: 'RUNNING' },
      ]);

      const result = await controller.syncHistory(mockReq(), 'ds-1');
      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundException when data source does not exist', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(controller.syncHistory(mockReq(), 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
