import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  dashboard: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(DashboardService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated dashboards with tenant scoping', async () => {
      const dashboards = [{ id: 'd1', name: 'Test', tenantId: 'tenant-1' }];
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);
      mockPrisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data).toEqual(dashboards);
      expect(result.total).toBe(1);
    });

    it('should use default pagination when no params given', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');

      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          skip: 0,
          take: 20,
        }),
      );
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard when found', async () => {
      const dashboard = { id: 'd1', name: 'Test', tenantId: 'tenant-1' };
      mockPrisma.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findOne('d1', 'tenant-1');

      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'd1', tenantId: 'tenant-1' },
        include: { widgets: true },
      });
      expect(result).toEqual(dashboard);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'missing', tenantId: 'tenant-1' },
        include: { widgets: true },
      });
    });
  });

  describe('create', () => {
    it('should create a new dashboard', async () => {
      const created = { id: 'd1', name: 'New Dashboard', tenantId: 'tenant-1' };
      mockPrisma.dashboard.create.mockResolvedValue(created);

      const result = await service.create(
        { name: 'New Dashboard' },
        'tenant-1',
        'user-1',
      );

      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Dashboard',
          tenantId: 'tenant-1',
          userId: 'user-1',
        }),
      });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update an existing dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 'tenant-1' });
      mockPrisma.dashboard.update.mockResolvedValue({ id: 'd1', name: 'Updated' });

      const result = await service.update('d1', { name: 'Updated' }, 'tenant-1');

      expect(mockPrisma.dashboard.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { name: 'Updated' },
      });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when updating non-existent dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'Updated' }, 'tenant-1'),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'missing', tenantId: 'tenant-1' },
        include: { widgets: true },
      });
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 'tenant-1' });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: 'd1' });

      await service.remove('d1', 'tenant-1');

      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'd1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.remove('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('executeRawTenantCount', () => {
    it('should execute raw SQL for tenant count', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(5);

      const result = await service.executeRawTenantCount('tenant-1');

      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });
});
