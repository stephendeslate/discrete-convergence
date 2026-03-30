import { Test } from '@nestjs/testing';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  dataSource: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
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

  describe('create', () => {
    it('should create a data source with tenant scoping', async () => {
      const created = { id: 'ds1', name: 'PG DB', tenantId: 't1' };
      mockPrisma.dataSource.create.mockResolvedValue(created);

      const result = await service.create({ name: 'PG DB', type: 'POSTGRESQL' }, 't1');

      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'PG DB', tenantId: 't1' }),
        }),
      );
      expect(result.id).toBe('ds1');
    });
  });

  describe('findAll', () => {
    it('should return paginated data sources for tenant', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([{ id: 'ds1' }]);
      mockPrisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, pageSize: 10 });

      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 't1' } }),
      );
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return data source when found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId: 't1' });

      const result = await service.findOne('ds1', 't1');

      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds1', tenantId: 't1' } }),
      );
      expect(result.id).toBe('ds1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('ds999', 't1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds999', tenantId: 't1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update data source after verifying existence', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId: 't1' });
      mockPrisma.dataSource.update.mockResolvedValue({ id: 'ds1', name: 'Updated' });

      const result = await service.update('ds1', { name: 'Updated' }, 't1');

      expect(mockPrisma.dataSource.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds1' } }),
      );
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete data source after verifying existence', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId: 't1' });
      mockPrisma.dataSource.delete.mockResolvedValue({ id: 'ds1' });

      await service.remove('ds1', 't1');

      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds1' } });
      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.remove('ds999', 't1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalled();
    });
  });
});
