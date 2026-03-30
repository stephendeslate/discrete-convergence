import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/infra/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

// TRACED:AE-TEST-003
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
    it('should create a dashboard', async () => {
      const mockDashboard = {
        id: 'dash-1',
        title: 'Test Dashboard',
        status: 'DRAFT',
        tenantId: 'tenant-1',
        widgets: [],
      };
      prisma.dashboard.create.mockResolvedValue(mockDashboard);

      const result = await service.create(
        { title: 'Test Dashboard' },
        'tenant-1',
      );

      expect(result).toEqual(mockDashboard);
      expect(prisma.dashboard.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', '1', '20');

      expect(result).toEqual({ data: [], total: 0, page: 1, pageSize: 20 });
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', '1', '500');

      expect(result.pageSize).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return dashboard by id', async () => {
      const mockDashboard = {
        id: 'dash-1',
        title: 'Test',
        tenantId: 'tenant-1',
        widgets: [],
      };
      prisma.dashboard.findUnique.mockResolvedValue(mockDashboard);

      const result = await service.findOne('dash-1', 'tenant-1');
      expect(result).toEqual(mockDashboard);
    });

    it('should throw NotFoundException for non-existent dashboard', async () => {
      prisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when tenantId does not match', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'other-tenant',
        widgets: [],
      });

      await expect(service.findOne('dash-1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        widgets: [],
      });
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        title: 'Updated',
        tenantId: 'tenant-1',
        widgets: [],
      });

      const result = await service.update(
        'dash-1',
        { title: 'Updated' },
        'tenant-1',
      );

      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      prisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        widgets: [],
      });
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      await service.remove('dash-1', 'tenant-1');

      expect(prisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
      });
    });

    it('should throw NotFoundException for non-existent dashboard on delete', async () => {
      prisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
