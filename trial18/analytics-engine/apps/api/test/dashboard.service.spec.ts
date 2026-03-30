import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  dashboard: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should create a dashboard with tenant isolation', async () => {
    const mockDashboard = { id: '1', title: 'Test', tenantId: 't1', widgets: [] };
    mockPrisma.dashboard.create.mockResolvedValue(mockDashboard);

    const result = await service.create({ title: 'Test' }, 't1');
    expect(result).toEqual(mockDashboard);
    expect(mockPrisma.dashboard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'Test', tenantId: 't1' }),
      }),
    );
  });

  it('should find all dashboards for a tenant', async () => {
    const mockDashboards = [{ id: '1', title: 'D1', tenantId: 't1' }];
    mockPrisma.dashboard.findMany.mockResolvedValue(mockDashboards);
    mockPrisma.dashboard.count.mockResolvedValue(1);

    const result = await service.findAll('t1', {});
    expect(result.data).toEqual(mockDashboards);
    expect(result.total).toBe(1);
    expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1' },
      }),
    );
  });

  it('should find one dashboard with tenant scoping', async () => {
    const mockDashboard = { id: '1', title: 'D1', tenantId: 't1', widgets: [] };
    mockPrisma.dashboard.findFirst.mockResolvedValue(mockDashboard);

    const result = await service.findOne('1', 't1');
    expect(result).toEqual(mockDashboard);
    expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1', tenantId: 't1' },
      }),
    );
  });

  it('should throw NotFoundException if dashboard not found', async () => {
    mockPrisma.dashboard.findFirst.mockResolvedValue(null);

    await expect(service.findOne('bad-id', 't1')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'bad-id', tenantId: 't1' } }),
    );
  });

  it('should update a dashboard', async () => {
    const existing = { id: '1', title: 'Old', tenantId: 't1', widgets: [] };
    const updated = { id: '1', title: 'New', tenantId: 't1', widgets: [] };
    mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
    mockPrisma.dashboard.update.mockResolvedValue(updated);

    const result = await service.update('1', { title: 'New' }, 't1');
    expect(result.title).toBe('New');
    expect(mockPrisma.dashboard.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ title: 'New' }),
      }),
    );
  });

  it('should delete a dashboard', async () => {
    const existing = { id: '1', title: 'D1', tenantId: 't1', widgets: [] };
    mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
    mockPrisma.dashboard.delete.mockResolvedValue(existing);

    await service.remove('1', 't1');
    expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
