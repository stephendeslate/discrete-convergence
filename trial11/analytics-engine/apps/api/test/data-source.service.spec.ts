import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/common/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  const prisma = {
    dataSource: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a data source with defaults', async () => {
      const dto = { name: 'PG Source', type: 'postgresql', config: '{}' };
      const expected = { id: 'ds-1', ...dto, refreshRate: 300, tenantId: 't-1' };
      prisma.dataSource.create.mockResolvedValue(expected);

      const result = await service.create(dto, 't-1');

      expect(result).toEqual(expected);
      expect(prisma.dataSource.create).toHaveBeenCalledWith({
        data: {
          name: 'PG Source',
          type: 'postgresql',
          config: '{}',
          refreshRate: 300,
          tenantId: 't-1',
        },
      });
    });

    it('should create a data source with custom refreshRate', async () => {
      const dto = { name: 'Fast Source', type: 'mysql', config: '{}', refreshRate: 60 };
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-2', ...dto, tenantId: 't-1' });

      await service.create(dto, 't-1');

      expect(prisma.dataSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ refreshRate: 60 }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results with tenant scoping', async () => {
      const mockSources = [{ id: 'ds-1', name: 'Source 1' }];
      prisma.dataSource.findMany.mockResolvedValue(mockSources);
      prisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll('t-1', '1', '10');

      expect(result.data).toEqual(mockSources);
      expect(result.total).toBe(1);
      expect(prisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't-1' },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should handle empty results', async () => {
      prisma.dataSource.findMany.mockResolvedValue([]);
      prisma.dataSource.count.mockResolvedValue(0);

      const result = await service.findAll('empty-tenant');

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(prisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'empty-tenant' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a data source by id and tenantId', async () => {
      const ds = { id: 'ds-1', name: 'Source', tenantId: 't-1', widgets: [] };
      prisma.dataSource.findFirst.mockResolvedValue(ds);

      const result = await service.findOne('ds-1', 't-1');

      expect(result).toEqual(ds);
      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId: 't-1' },
        include: { widgets: true },
      });
    });

    it('should throw NotFoundException for missing data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad', 't-1')).rejects.toThrow(NotFoundException);
      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad', tenantId: 't-1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update an existing data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 't-1', widgets: [] });
      prisma.dataSource.update.mockResolvedValue({ id: 'ds-1', name: 'Updated' });

      const result = await service.update('ds-1', { name: 'Updated' }, 't-1');

      expect(result.name).toBe('Updated');
      expect(prisma.dataSource.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds-1' } }),
      );
    });

    it('should throw when updating non-existent data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.update('bad', { name: 'X' }, 't-1')).rejects.toThrow(NotFoundException);
      expect(prisma.dataSource.findFirst).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 't-1', widgets: [] });
      prisma.dataSource.delete.mockResolvedValue({ id: 'ds-1' });

      await service.remove('ds-1', 't-1');

      expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds-1', tenantId: 't-1' } }),
      );
    });

    it('should throw when removing non-existent data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.remove('bad', 't-1')).rejects.toThrow(NotFoundException);
      expect(prisma.dataSource.findFirst).toHaveBeenCalled();
    });
  });
});
