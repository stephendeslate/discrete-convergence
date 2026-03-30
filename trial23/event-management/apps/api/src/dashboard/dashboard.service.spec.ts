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
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
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
    const dto = { name: 'Analytics Dashboard' };
    const expected = { id: 'dash-1', ...dto, organizationId: 'org-1', status: 'DRAFT' };
    prisma.dashboard.create.mockResolvedValue(expected);

    const result = await service.create('org-1', dto);
    expect(result).toEqual(expected);
    expect(prisma.dashboard.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: 'org-1', status: 'DRAFT' }),
    });
  });

  it('should return paginated dashboards', async () => {
    prisma.dashboard.findMany.mockResolvedValue([{ id: 'dash-1' }]);
    prisma.dashboard.count.mockResolvedValue(1);

    const result = await service.findAll('org-1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);

    await expect(service.findOne('org-1', 'dash-999')).rejects.toThrow(NotFoundException);
  });

  it('should soft-delete (archive) a dashboard', async () => {
    const dashboard = { id: 'dash-1', organizationId: 'org-1', status: 'DRAFT' };
    prisma.dashboard.findFirst.mockResolvedValue(dashboard);
    prisma.dashboard.update.mockResolvedValue({ ...dashboard, status: 'ARCHIVED' });

    const result = await service.remove('org-1', 'dash-1');
    expect(result.status).toBe('ARCHIVED');
  });
});
