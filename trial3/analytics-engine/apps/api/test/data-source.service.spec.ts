import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  tenant: {
    findUnique: jest.fn(),
  },
  dataSource: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  syncRun: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
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
    it('should create a data source', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1', tier: 'PRO' });
      mockPrisma.dataSource.count.mockResolvedValue(0);
      const expected = { id: 'ds1', name: 'Test DS', tenantId: 't1', fieldMappings: [] };
      mockPrisma.dataSource.create.mockResolvedValue(expected);

      const result = await service.create('t1', 'Test DS', 'REST_API', 'encrypted');
      expect(result).toEqual(expected);
    });

    it('should reject when tier limit exceeded', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1', tier: 'FREE' });
      mockPrisma.dataSource.count.mockResolvedValue(3);

      await expect(
        service.create('t1', 'Extra', 'REST_API', 'encrypted'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject schedule not in tier allowlist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1', tier: 'FREE' });
      mockPrisma.dataSource.count.mockResolvedValue(0);

      await expect(
        service.create('t1', 'Test', 'REST_API', 'encrypted', 'DAILY'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);
      await expect(service.findOne('ds1', 't1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('triggerSync', () => {
    it('should reject sync on paused data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue({
        id: 'ds1', tenantId: 't1', paused: true, fieldMappings: [],
      });
      await expect(service.triggerSync('ds1', 't1')).rejects.toThrow(BadRequestException);
    });
  });
});
