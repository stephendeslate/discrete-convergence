import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED:AE-TST-003 — dashboard unit tests with mocked Prisma
describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
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
    const mockDashboard = {
      id: 'dash-1',
      title: 'Test',
      status: 'DRAFT',
      tenantId: 'tenant-1',
    };
    prisma.dashboard.create.mockResolvedValue(mockDashboard);

    const result = await service.create('tenant-1', { title: 'Test' });
    expect(result).toEqual(mockDashboard);
    expect(prisma.dashboard.create).toHaveBeenCalledWith({
      data: { title: 'Test', tenantId: 'tenant-1' },
    });
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma.dashboard.findFirst.mockResolvedValue(null);
    await expect(service.findOne('tenant-1', 'nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return paginated dashboards', async () => {
    prisma.dashboard.findMany.mockResolvedValue([]);
    prisma.dashboard.count.mockResolvedValue(0);

    const result = await service.findAll('tenant-1', 1, 10);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('should update a dashboard', async () => {
    const existing = {
      id: 'dash-1',
      title: 'Old',
      status: 'DRAFT',
      tenantId: 'tenant-1',
      widgets: [],
      embedConfig: null,
    };
    prisma.dashboard.findFirst.mockResolvedValue(existing);
    prisma.dashboard.update.mockResolvedValue({
      ...existing,
      title: 'Updated',
    });

    const result = await service.update('tenant-1', 'dash-1', {
      title: 'Updated',
    });
    expect(result.title).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    prisma.dashboard.findFirst.mockResolvedValue({
      id: 'dash-1',
      tenantId: 'tenant-1',
      widgets: [],
      embedConfig: null,
    });
    prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

    const result = await service.remove('tenant-1', 'dash-1');
    expect(result.id).toBe('dash-1');
  });
});
