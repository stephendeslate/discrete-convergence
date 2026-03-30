import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  dashboard: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
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
    it('should return paginated dashboards for tenant', async () => {
      const mockDashboards = [{ id: 'd-1', name: 'Dashboard 1', tenantId: 'tenant-1' }];
      mockPrisma.dashboard.findMany.mockResolvedValue(mockDashboards);
      mockPrisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', { page: 1, limit: 10 });

      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result.data).toEqual(mockDashboards);
      expect(result.total).toBe(1);
    });

    it('should use default pagination when no params provided', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', {});

      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id and tenant', async () => {
      const mockDashboard = { id: 'd-1', name: 'Test', tenantId: 'tenant-1', widgets: [] };
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);

      const result = await service.findOne('d-1', 'tenant-1');

      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-1' } }),
      );
      expect(result).toEqual(mockDashboard);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'nonexistent' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: 'd-1', tenantId: 'other-tenant', widgets: [],
      });

      await expect(service.findOne('d-1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a dashboard with tenant id', async () => {
      const created = { id: 'd-new', name: 'New', tenantId: 'tenant-1', status: 'DRAFT' };
      mockPrisma.dashboard.create.mockResolvedValue(created);

      const result = await service.create('tenant-1', { name: 'New' });

      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'New', tenantId: 'tenant-1' }),
        }),
      );
      expect(result.id).toBe('d-new');
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: 'd-1', tenantId: 'tenant-1', widgets: [],
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'd-1', name: 'Updated', tenantId: 'tenant-1',
      });

      const result = await service.update('d-1', 'tenant-1', { name: 'Updated' });

      expect(mockPrisma.dashboard.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-1' } }),
      );
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard by id', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: 'd-1', tenantId: 'tenant-1', widgets: [],
      });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: 'd-1' });

      await service.remove('d-1', 'tenant-1');

      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'd-1' } });
    });

    it('should throw NotFoundException when deleting nonexistent', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });
});
