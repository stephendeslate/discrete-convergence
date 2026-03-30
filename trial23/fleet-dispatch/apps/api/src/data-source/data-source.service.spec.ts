import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../infra/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    dataSource: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    $queryRaw: jest.Mock;
    setTenantContext: jest.Mock;
  };

  const companyId = 'comp-1';

  beforeEach(async () => {
    prisma = {
      dataSource: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $queryRaw: jest.fn(),
      setTenantContext: jest.fn(),
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
    prisma.dataSource.create.mockResolvedValue({
      id: 'ds-1',
      name: 'Prod DB',
      type: 'POSTGRES',
      connectionString: 'postgres://host/db',
      companyId,
    });

    const result = await service.create(companyId, {
      name: 'Prod DB',
      type: 'POSTGRES' as never,
      connectionString: 'postgres://host/db',
    });

    expect(result.name).toBe('Prod DB');
    expect(prisma.setTenantContext).toHaveBeenCalledWith(companyId);
  });

  it('should reject connection string with SQL injection', async () => {
    await expect(
      service.create(companyId, {
        name: 'Bad Source',
        type: 'POSTGRES' as never,
        connectionString: 'postgres://host/db; DROP TABLE users',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw 404 for non-existent data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);

    await expect(service.findOne(companyId, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should test connection and return sanitized string', async () => {
    prisma.dataSource.findFirst.mockResolvedValue({
      id: 'ds-1',
      connectionString: 'postgres://user:password=secret@host/db',
      companyId,
    });
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.testConnection(companyId, 'ds-1');

    expect(result.success).toBe(true);
    expect(result.sanitizedConnection).not.toContain('secret');
  });
});
