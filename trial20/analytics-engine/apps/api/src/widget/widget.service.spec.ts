import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  widget: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
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
    it('should return paginated widgets with tenant scoping', async () => {
      const widgets = [{ id: 'w1', name: 'Chart', tenantId: 'tenant-1' }];
      mockPrisma.widget.findMany.mockResolvedValue(widgets);
      mockPrisma.widget.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data).toEqual(widgets);
      expect(result.total).toBe(1);
    });

    it('should use default pagination', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([]);
      mockPrisma.widget.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');

      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a widget when found', async () => {
      const widget = { id: 'w1', name: 'Chart', tenantId: 'tenant-1' };
      mockPrisma.widget.findFirst.mockResolvedValue(widget);

      const result = await service.findOne('w1', 'tenant-1');

      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith({
        where: { id: 'w1', tenantId: 'tenant-1' },
        include: { dashboard: true, dataSource: true },
      });
      expect(result).toEqual(widget);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith({
        where: { id: 'missing', tenantId: 'tenant-1' },
        include: { dashboard: true, dataSource: true },
      });
    });
  });

  describe('create', () => {
    it('should create a new widget', async () => {
      const created = { id: 'w1', name: 'New Chart', tenantId: 'tenant-1' };
      mockPrisma.widget.create.mockResolvedValue(created);

      const result = await service.create(
        { name: 'New Chart', type: 'CHART', dashboardId: 'd1' },
        'tenant-1',
      );

      expect(mockPrisma.widget.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Chart',
          type: 'CHART',
          tenantId: 'tenant-1',
          dashboardId: 'd1',
        }),
      });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update an existing widget', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({ id: 'w1', tenantId: 'tenant-1' });
      mockPrisma.widget.update.mockResolvedValue({ id: 'w1', name: 'Updated' });

      const result = await service.update('w1', { name: 'Updated' }, 'tenant-1');

      expect(mockPrisma.widget.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: { name: 'Updated' },
      });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when updating non-existent widget', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'Updated' }, 'tenant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({ id: 'w1', tenantId: 'tenant-1' });
      mockPrisma.widget.delete.mockResolvedValue({ id: 'w1' });

      await service.remove('w1', 'tenant-1');

      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({
        where: { id: 'w1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent widget', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.remove('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByDashboard', () => {
    it('should return widgets for a specific dashboard', async () => {
      const widgets = [{ id: 'w1', dashboardId: 'd1' }];
      mockPrisma.widget.findMany.mockResolvedValue(widgets);

      const result = await service.findByDashboard('d1', 'tenant-1');

      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith({
        where: { dashboardId: 'd1', tenantId: 'tenant-1' },
        include: { dataSource: true },
        orderBy: { positionY: 'asc' },
      });
      expect(result).toEqual(widgets);
    });
  });
});
