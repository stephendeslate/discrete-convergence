// TRACED:TEST-DATASOURCE-SERVICE — Unit tests for DataSourceService
import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.module';
import { NotFoundException } from '@nestjs/common';

const tenantId = '00000000-0000-0000-0000-000000000001';
const dsId = '00000000-0000-0000-0000-000000000010';

const mockDs = {
  id: dsId,
  name: 'Prod DB',
  type: 'postgresql',
  connectionString: 'postgresql://localhost/test',
  tenantId,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  dataSource: {
    create: jest.fn().mockResolvedValue(mockDs),
    findMany: jest.fn().mockResolvedValue([mockDs]),
    findFirst: jest.fn().mockResolvedValue(mockDs),
    count: jest.fn().mockResolvedValue(1),
    update: jest.fn().mockResolvedValue({ ...mockDs, name: 'Updated' }),
    delete: jest.fn().mockResolvedValue(mockDs),
  },
};

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  describe('create', () => {
    it('should create a data source with tenant isolation', async () => {
      const result = await service.create(
        { name: 'New DB', type: 'postgresql', connectionString: 'pg://localhost/db' },
        tenantId,
      );
      expect(result).toHaveProperty('id');
      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const result = await service.findAll(tenantId, 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a data source by id', async () => {
      const result = await service.findOne(dsId, tenantId);
      expect(result.id).toBe(dsId);
    });

    it('should throw NotFoundException when missing', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValueOnce(null);
      await expect(service.findOne('nonexistent', tenantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update data source fields', async () => {
      const result = await service.update(dsId, { name: 'Updated' }, tenantId);
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete the data source', async () => {
      await service.remove(dsId, tenantId);
      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: dsId } });
    });
  });
});
