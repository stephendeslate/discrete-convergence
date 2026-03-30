import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  dataSource: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(DataSourceService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated data sources with tenant scoping', async () => {
      const sources = [{ id: 'ds1', name: 'DB', tenantId: 'tenant-1' }];
      mockPrisma.dataSource.findMany.mockResolvedValue(sources);
      mockPrisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data).toEqual(sources);
      expect(result.total).toBe(1);
    });

    it('should use default pagination', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([]);
      mockPrisma.dataSource.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');

      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a data source when found', async () => {
      const ds = { id: 'ds1', name: 'DB', tenantId: 'tenant-1' };
      mockPrisma.dataSource.findFirst.mockResolvedValue(ds);

      const result = await service.findOne('ds1', 'tenant-1');

      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds1', tenantId: 'tenant-1' },
        include: { widgets: true },
      });
      expect(result).toEqual(ds);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'missing', tenantId: 'tenant-1' },
        include: { widgets: true },
      });
    });
  });

  describe('create', () => {
    it('should create a new data source', async () => {
      const created = { id: 'ds1', name: 'New DB', tenantId: 'tenant-1' };
      mockPrisma.dataSource.create.mockResolvedValue(created);

      const result = await service.create(
        { name: 'New DB', type: 'POSTGRESQL' },
        'tenant-1',
        'user-1',
      );

      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New DB',
          type: 'POSTGRESQL',
          tenantId: 'tenant-1',
          userId: 'user-1',
        }),
      });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update an existing data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId: 'tenant-1' });
      mockPrisma.dataSource.update.mockResolvedValue({ id: 'ds1', name: 'Updated' });

      const result = await service.update('ds1', { name: 'Updated' }, 'tenant-1');

      expect(mockPrisma.dataSource.update).toHaveBeenCalledWith({
        where: { id: 'ds1' },
        data: { name: 'Updated' },
      });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when updating non-existent source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'Updated' }, 'tenant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId: 'tenant-1' });
      mockPrisma.dataSource.delete.mockResolvedValue({ id: 'ds1' });

      await service.remove('ds1', 'tenant-1');

      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({
        where: { id: 'ds1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.remove('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
