import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  const mockPrisma = {
    dashboard: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const tenantId = 'tenant-1';
  const mockDashboard = {
    id: 'dash-1',
    name: 'Test',
    description: 'Test desc',
    status: 'DRAFT',
    tenantId,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [],
  };

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

  it('should create a dashboard', async () => {
    mockPrisma.dashboard.create.mockResolvedValue(mockDashboard);

    const result = await service.create({ name: 'Test', description: 'Test desc' }, tenantId, 'user-1');
    expect(result).toEqual(mockDashboard);
    expect(mockPrisma.dashboard.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Test', tenantId }),
      }),
    );
  });

  it('should find all dashboards', async () => {
    mockPrisma.dashboard.findMany.mockResolvedValue([mockDashboard]);
    mockPrisma.dashboard.count.mockResolvedValue(1);

    const result = await service.findAll(tenantId);
    expect(result.items).toEqual([mockDashboard]);
    expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId },
      }),
    );
  });

  it('should find one dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);

    const result = await service.findOne('dash-1', tenantId);
    expect(result).toEqual(mockDashboard);
    expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'dash-1' } }),
    );
  });

  it('should throw NotFoundException for missing dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', tenantId)).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'missing' } }),
    );
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue({
      ...mockDashboard,
      tenantId: 'other-tenant',
    });

    await expect(service.findOne('dash-1', tenantId)).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'dash-1' } }),
    );
  });

  it('should update a dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
    mockPrisma.dashboard.update.mockResolvedValue({ ...mockDashboard, name: 'Updated' });

    const result = await service.update('dash-1', { name: 'Updated' }, tenantId);
    expect(result.name).toBe('Updated');
    expect(mockPrisma.dashboard.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'dash-1' } }),
    );
  });

  it('should delete a dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
    mockPrisma.dashboard.delete.mockResolvedValue(mockDashboard);

    await service.remove('dash-1', tenantId);
    expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
  });
});
