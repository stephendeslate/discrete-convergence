import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/infra/prisma.service';

const mockPrisma = {
  dashboard: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $executeRaw: jest.fn(),
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

  describe('create', () => {
    it('should create a dashboard with correct data', async () => {
      const mockDashboard = {
        id: 'dash-1',
        title: 'Test',
        tenantId: 'tenant-1',
        widgets: [],
      };
      mockPrisma.dashboard.create.mockResolvedValue(mockDashboard);

      const result = await service.create(
        { title: 'Test' },
        'tenant-1',
        'user-1',
      );

      expect(result).toEqual(mockDashboard);
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: {
          title: 'Test',
          description: undefined,
          status: 'DRAFT',
          tenantId: 'tenant-1',
          createdById: 'user-1',
        },
        include: { widgets: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards for tenant', async () => {
      const mockDashboards = [{ id: 'dash-1', title: 'Test' }];
      mockPrisma.dashboard.findMany.mockResolvedValue(mockDashboards);
      mockPrisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.data).toEqual(mockDashboards);
      expect(result.total).toBe(1);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        }),
      );
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', '1', '500');

      expect(result.pageSize).toBe(100);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id and tenant', async () => {
      const mockDashboard = { id: 'dash-1', title: 'Test', tenantId: 'tenant-1' };
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);

      const result = await service.findOne('dash-1', 'tenant-1');

      expect(result).toEqual(mockDashboard);
      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
        include: expect.objectContaining({ widgets: true }),
      });
    });

    it('should throw NotFoundException for non-existent dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith({
        where: { id: 'bad-id' },
        include: expect.objectContaining({ widgets: true }),
      });
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne('dash-1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
        include: expect.objectContaining({ widgets: true }),
      });
    });
  });

  describe('update', () => {
    it('should update dashboard with correct data', async () => {
      const existing = { id: 'dash-1', tenantId: 'tenant-1' };
      mockPrisma.dashboard.findUnique.mockResolvedValue(existing);
      mockPrisma.dashboard.update.mockResolvedValue({
        ...existing,
        title: 'Updated',
        widgets: [],
      });

      const result = await service.update('dash-1', { title: 'Updated' }, 'tenant-1');

      expect(result.title).toBe('Updated');
      expect(mockPrisma.dashboard.update).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
        data: { title: 'Updated' },
        include: { widgets: true },
      });
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      const existing = { id: 'dash-1', tenantId: 'tenant-1' };
      mockPrisma.dashboard.findUnique.mockResolvedValue(existing);
      mockPrisma.dashboard.delete.mockResolvedValue(existing);

      const result = await service.remove('dash-1', 'tenant-1');

      expect(result).toEqual(existing);
      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith({
        where: { id: 'bad-id' },
        include: expect.objectContaining({ widgets: true }),
      });
    });
  });

  describe('getStats', () => {
    it('should execute raw SQL for tenant stats', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(5);

      const result = await service.getStats('tenant-1');

      expect(result.affectedRows).toBe(5);
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
