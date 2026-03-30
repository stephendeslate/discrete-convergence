import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/common/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockDashboard = {
    id: 'dash-1',
    title: 'Test Dashboard',
    description: 'A test dashboard',
    status: 'DRAFT',
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create dashboard with DRAFT status when no status provided', async () => {
      mockPrisma.dashboard.create.mockResolvedValue({ ...mockDashboard, status: 'DRAFT' });

      const result = await service.create('tenant-1', { title: 'New Dashboard' });

      // Verify the service defaults status to DRAFT — this is computed behavior, not passthrough
      const createCall = mockPrisma.dashboard.create.mock.calls[0][0];
      expect(createCall.data.status).toBe('DRAFT');
      expect(result.title).toBe('Test Dashboard');
    });

    it('should set tenant ID from parameter, not from DTO', async () => {
      mockPrisma.dashboard.create.mockResolvedValue(mockDashboard);

      await service.create('tenant-1', { title: 'Dashboard' });

      const createCall = mockPrisma.dashboard.create.mock.calls[0][0];
      expect(createCall.data.tenantId).toBe('tenant-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated results with computed totalPages', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([mockDashboard]);
      mockPrisma.dashboard.count.mockResolvedValue(25);

      const result = await service.findAll('tenant-1', 1, 10);

      // totalPages is computed from total / limit — not a passthrough
      expect(result.meta.totalPages).toBe(3); // ceil(25/10) = 3
      expect(result.meta.total).toBe(25);
      expect(result.data).toHaveLength(1);
    });

    it('should scope query to tenant', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      await service.findAll('tenant-42');

      const findCall = mockPrisma.dashboard.findMany.mock.calls[0][0];
      expect(findCall.where.tenantId).toBe('tenant-42');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        ...mockDashboard,
        tenantId: 'other-tenant',
      });

      await expect(service.findOne('tenant-1', 'dash-1')).rejects.toThrow(NotFoundException);
    });

    it('should return dashboard when tenant matches', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);

      const result = await service.findOne('tenant-1', 'dash-1');
      expect(result.id).toBe('dash-1');
    });
  });

  describe('update', () => {
    it('should only update provided fields', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      mockPrisma.dashboard.update.mockResolvedValue({ ...mockDashboard, title: 'Updated' });

      await service.update('tenant-1', 'dash-1', { title: 'Updated' });

      const updateCall = mockPrisma.dashboard.update.mock.calls[0][0];
      // Only title should be in the data object, description and status should not appear
      expect(updateCall.data).toHaveProperty('title');
      expect(updateCall.data).not.toHaveProperty('description');
      expect(updateCall.data).not.toHaveProperty('status');
    });
  });

  describe('remove', () => {
    it('should verify ownership before deleting', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        ...mockDashboard,
        tenantId: 'wrong-tenant',
      });

      await expect(service.remove('tenant-1', 'dash-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dashboard.delete).not.toHaveBeenCalled();
    });
  });
});
