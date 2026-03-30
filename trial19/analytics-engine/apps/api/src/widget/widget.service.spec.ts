import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  widget: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(WidgetService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated widgets for tenant', async () => {
      const mockWidgets = [{ id: 'w-1', name: 'Chart', tenantId: 'tenant-1' }];
      mockPrisma.widget.findMany.mockResolvedValue(mockWidgets);
      mockPrisma.widget.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', { page: 1, limit: 10 });

      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result.data).toEqual(mockWidgets);
      expect(result.total).toBe(1);
    });

    it('should handle empty result set', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([]);
      mockPrisma.widget.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', {});

      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return widget by id and tenant', async () => {
      const mockWidget = { id: 'w-1', name: 'Chart', tenantId: 'tenant-1', dashboard: {}, dataSource: null };
      mockPrisma.widget.findUnique.mockResolvedValue(mockWidget);

      const result = await service.findOne('w-1', 'tenant-1');

      expect(mockPrisma.widget.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'w-1' } }),
      );
      expect(result).toEqual(mockWidget);
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.widget.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({
        id: 'w-1', tenantId: 'other', dashboard: {}, dataSource: null,
      });

      await expect(service.findOne('w-1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a widget with tenant and dashboard', async () => {
      const created = { id: 'w-new', name: 'New Widget', type: 'CHART', tenantId: 'tenant-1' };
      mockPrisma.widget.create.mockResolvedValue(created);

      const result = await service.create('tenant-1', {
        name: 'New Widget',
        type: 'CHART',
        dashboardId: 'd-1',
      });

      expect(mockPrisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'New Widget',
            type: 'CHART',
            dashboardId: 'd-1',
            tenantId: 'tenant-1',
          }),
        }),
      );
      expect(result.id).toBe('w-new');
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({
        id: 'w-1', tenantId: 'tenant-1', dashboard: {}, dataSource: null,
      });
      mockPrisma.widget.update.mockResolvedValue({
        id: 'w-1', name: 'Updated Widget', tenantId: 'tenant-1',
      });

      const result = await service.update('w-1', 'tenant-1', { name: 'Updated Widget' });

      expect(mockPrisma.widget.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'w-1' } }),
      );
      expect(result.name).toBe('Updated Widget');
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({
        id: 'w-1', tenantId: 'tenant-1', dashboard: {}, dataSource: null,
      });
      mockPrisma.widget.delete.mockResolvedValue({ id: 'w-1' });

      await service.remove('w-1', 'tenant-1');

      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w-1' } });
    });

    it('should throw NotFoundException when deleting nonexistent widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });
});
