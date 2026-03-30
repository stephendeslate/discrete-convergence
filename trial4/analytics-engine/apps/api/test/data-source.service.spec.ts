import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from '../src/data-source/data-source.service';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED:AE-TST-004 — data source unit tests with mocked Prisma
describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    dataSource: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    syncRun: {
      findMany: jest.Mock;
    };
    $executeRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      syncRun: {
        findMany: jest.fn(),
      },
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should create a data source', async () => {
    const mockDs = {
      id: 'ds-1',
      name: 'Sales API',
      type: 'REST_API',
      tenantId: 'tenant-1',
    };
    prisma.dataSource.create.mockResolvedValue(mockDs);

    const result = await service.create('tenant-1', {
      name: 'Sales API',
      type: 'REST_API',
      configEncrypted: 'enc-config',
    });
    expect(result).toEqual(mockDs);
  });

  it('should throw NotFoundException when data source not found', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.findOne('tenant-1', 'nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return paginated data sources', async () => {
    prisma.dataSource.findMany.mockResolvedValue([]);
    prisma.dataSource.count.mockResolvedValue(0);

    const result = await service.findAll('tenant-1', 1, 20);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('should set tenant context via $executeRaw', async () => {
    prisma.$executeRaw.mockResolvedValue(undefined);
    await service.setTenantContext('tenant-1');
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('should get sync history for a data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue({
      id: 'ds-1',
      tenantId: 'tenant-1',
      fieldMappings: [],
      syncRuns: [],
    });
    prisma.syncRun.findMany.mockResolvedValue([]);

    const result = await service.getSyncHistory('tenant-1', 'ds-1');
    expect(result).toEqual([]);
  });
});
