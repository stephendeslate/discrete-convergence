import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

jest.mock('@analytics-engine/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  ALLOWED_REGISTRATION_ROLES: ['user', 'admin'],
}));

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
  const tenantId = 'tenant-1';

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
    it('should create a data source with tenantId', async () => {
      const dto: CreateDataSourceDto = { name: 'Test DS', type: 'POSTGRES', connectionInfo: { host: 'localhost' } };
      const expected = { id: 'ds-1', ...dto, tenantId };
      mockPrisma.dataSource.create.mockResolvedValue(expected);

      const result = await service.create(dto, tenantId);

      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          type: dto.type,
          connectionInfo: dto.connectionInfo,
          tenantId,
        },
        include: { widgets: true },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated data sources', async () => {
      const dataSources = [{ id: 'ds-1', name: 'Test' }];
      mockPrisma.dataSource.findMany.mockResolvedValue(dataSources);
      mockPrisma.dataSource.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, {});

      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { widgets: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.dataSource.count).toHaveBeenCalledWith({ where: { tenantId } });
      expect(result).toEqual({ data: dataSources, total: 1, page: 1, pageSize: 10 });
    });
  });

  describe('findOne', () => {
    it('should return a data source by id and tenantId', async () => {
      const dataSource = { id: 'ds-1', name: 'Test', tenantId };
      mockPrisma.dataSource.findFirst.mockResolvedValue(dataSource);

      const result = await service.findOne('ds-1', tenantId);

      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId },
        include: { widgets: true },
      });
      expect(result).toEqual(dataSource);
    });

    it('should throw NotFoundException when data source not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', tenantId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'non-existent', tenantId },
        include: { widgets: true },
      });
    });
  });

  describe('update', () => {
    it('should update a data source after verifying it exists', async () => {
      const existing = { id: 'ds-1', name: 'Old', tenantId };
      const dto: UpdateDataSourceDto = { name: 'Updated', type: 'MYSQL', connectionInfo: { host: 'remote' } };
      mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
      mockPrisma.dataSource.update.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update('ds-1', dto, tenantId);

      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId },
        include: { widgets: true },
      });
      expect(mockPrisma.dataSource.update).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
        data: { name: dto.name, type: dto.type, connectionInfo: dto.connectionInfo },
        include: { widgets: true },
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a data source after verifying it exists', async () => {
      const existing = { id: 'ds-1', tenantId };
      mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
      mockPrisma.dataSource.delete.mockResolvedValue(existing);

      await service.remove('ds-1', tenantId);

      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId },
        include: { widgets: true },
      });
      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
    });
  });
});
