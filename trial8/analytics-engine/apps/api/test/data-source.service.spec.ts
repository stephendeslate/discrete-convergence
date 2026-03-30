import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaModel } from './helpers/mock-prisma';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      dataSource: createMockPrismaModel(),
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DataSourceService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  describe('create', () => {
    it('should create a data source with tenant context', async () => {
      prisma.dataSource.create.mockResolvedValue({ id: 'ds1', name: 'My API', type: 'API' });

      const result = await service.create('t1', { name: 'My API', type: 'API' });

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(prisma.dataSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'My API', type: 'API', tenantId: 't1' }),
        }),
      );
      expect(result).toHaveProperty('id', 'ds1');
    });
  });

  describe('findOne', () => {
    it('should return data source when found with tenant scope', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', name: 'Source', tenantId: 't1' });

      const result = await service.findOne('t1', 'ds1');

      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds1', tenantId: 't1' } }),
      );
      expect(result).toHaveProperty('name', 'Source');
    });

    it('should throw NotFoundException when data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad-id', tenantId: 't1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update data source after verifying it exists', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId: 't1' });
      prisma.dataSource.update.mockResolvedValue({ id: 'ds1', name: 'Updated' });

      const result = await service.update('t1', 'ds1', { name: 'Updated' });

      expect(prisma.dataSource.findFirst).toHaveBeenCalled();
      expect(prisma.dataSource.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'ds1' } }),
      );
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when updating non-existent data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.update('t1', 'bad', { name: 'X' })).rejects.toThrow(NotFoundException);
      expect(prisma.dataSource.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete data source after verifying it exists', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId: 't1' });
      prisma.dataSource.delete.mockResolvedValue({ id: 'ds1' });

      const result = await service.remove('t1', 'ds1');

      expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds1' } });
      expect(result).toHaveProperty('id', 'ds1');
    });
  });
});
