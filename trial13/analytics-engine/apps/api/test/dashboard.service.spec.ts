import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService, mockTenantId } from './helpers/test-utils';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('create', () => {
    it('should create a dashboard with correct tenant', async () => {
      const mockDashboard = {
        id: 'dash-1',
        title: 'Test Dashboard',
        description: 'Test',
        status: 'DRAFT',
        tenantId: mockTenantId,
        widgets: [],
      };
      prisma.dashboard.create.mockResolvedValue(mockDashboard);

      const result = await service.create(
        { title: 'Test Dashboard', description: 'Test' },
        mockTenantId,
      );

      expect(result).toEqual(mockDashboard);
      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Test Dashboard',
            tenantId: mockTenantId,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards for tenant', async () => {
      const mockDashboards = [
        { id: 'dash-1', title: 'D1', tenantId: mockTenantId, widgets: [] },
      ];
      prisma.dashboard.findMany.mockResolvedValue(mockDashboards);
      prisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll(mockTenantId);

      expect(result.data).toEqual(mockDashboards);
      expect(result.total).toBe(1);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: mockTenantId },
        }),
      );
    });

    it('should apply pagination parameters', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll(mockTenantId, 2, 10);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id and tenant', async () => {
      const mockDashboard = {
        id: 'dash-1',
        title: 'D1',
        tenantId: mockTenantId,
        widgets: [],
      };
      prisma.dashboard.findUnique.mockResolvedValue(mockDashboard);

      const result = await service.findOne('dash-1', mockTenantId);

      expect(result).toEqual(mockDashboard);
      expect(prisma.dashboard.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dash-1' },
        }),
      );
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dashboard.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'bad-id' },
        }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'D1',
        tenantId: 'other-tenant',
        widgets: [],
      });

      await expect(service.findOne('dash-1', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dashboard.findUnique).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'Old',
        tenantId: mockTenantId,
        widgets: [],
      });
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        title: 'New',
        tenantId: mockTenantId,
        widgets: [],
      });

      const result = await service.update('dash-1', { title: 'New' }, mockTenantId);

      expect(result.title).toBe('New');
      expect(prisma.dashboard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dash-1' },
          data: expect.objectContaining({ title: 'New' }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        title: 'D1',
        tenantId: mockTenantId,
        widgets: [],
      });
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      await service.remove('dash-1', mockTenantId);

      expect(prisma.dashboard.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'dash-1' } }),
      );
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      prisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dashboard.delete).not.toHaveBeenCalled();
    });
  });
});
