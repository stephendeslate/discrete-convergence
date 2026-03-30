import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    setTenantContext: jest.Mock;
  };

  const companyId = 'comp-1';
  const userId = 'user-1';

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should create a dashboard', async () => {
    prisma.dashboard.create.mockResolvedValue({
      id: 'dash-1',
      name: 'Overview',
      companyId,
      userId,
    });

    const result = await service.create(companyId, userId, { name: 'Overview' });

    expect(result.name).toBe('Overview');
    expect(prisma.setTenantContext).toHaveBeenCalledWith(companyId);
  });

  it('should return paginated dashboards', async () => {
    prisma.dashboard.findMany.mockResolvedValue([{ id: 'dash-1' }]);
    prisma.dashboard.count.mockResolvedValue(1);

    const result = await service.findAll(companyId, 1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should throw 404 for non-existent dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);

    await expect(service.findOne(companyId, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
