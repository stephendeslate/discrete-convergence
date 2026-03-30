import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.service';

// TRACED: AE-WIDGET-001 — Create widget
// TRACED: AE-WIDGET-003 — Get widget data
// TRACED: AE-EDGE-003 — Widget count exceeds maximum per dashboard

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      dashboard: { findFirst: jest.fn() },
      widget: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  describe('create', () => {
    it('should create a widget when dashboard exists', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', tenantId: 'tenant-1', widgets: [] });
      prisma.widget.create.mockResolvedValue({ id: 'widget-1', name: 'Test Widget' });

      const result = await service.create('tenant-1', 'dash-1', { name: 'Test Widget', type: 'LINE_CHART' as never });
      expect(result.name).toBe('Test Widget');
    });

    it('should throw NotFoundException when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.create('tenant-1', 'missing', { name: 'W', type: 'LINE_CHART' as never }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when widget count exceeds maximum', async () => {
      const widgets = Array.from({ length: 20 }, (_, i) => ({ id: `w-${i}` }));
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', tenantId: 'tenant-1', widgets });

      await expect(
        service.create('tenant-1', 'dash-1', { name: 'Overflow', type: 'LINE_CHART' as never }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getWidgetData', () => {
    it('should throw NotFoundException for missing widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.getWidgetData('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when widget has no data source', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'w-1',
        dataSourceId: null,
        dashboard: { tenantId: 'tenant-1' },
      });

      await expect(service.getWidgetData('tenant-1', 'w-1')).rejects.toThrow(BadRequestException);
    });

    it('should return KPI data for KPI_CARD widget', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'w-1',
        type: 'KPI_CARD',
        name: 'Revenue',
        dataSourceId: 'ds-1',
        dashboard: { tenantId: 'tenant-1' },
      });

      const result = await service.getWidgetData('tenant-1', 'w-1');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('trend');
    });

    it('should return chart data for non-KPI widget', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'w-1',
        type: 'LINE_CHART',
        name: 'Sales',
        dataSourceId: 'ds-1',
        dashboard: { tenantId: 'tenant-1' },
      });

      const result = await service.getWidgetData('tenant-1', 'w-1');
      expect(result).toHaveProperty('labels');
      expect(result).toHaveProperty('datasets');
    });

    it('should throw NotFoundException when widget belongs to different tenant', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'w-1',
        dataSourceId: 'ds-1',
        dashboard: { tenantId: 'other-tenant' },
      });

      await expect(service.getWidgetData('tenant-1', 'w-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllForDashboard', () => {
    it('should list widgets for a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', tenantId: 'tenant-1' });
      prisma.widget.findMany.mockResolvedValue([{ id: 'w-1' }, { id: 'w-2' }]);

      const result = await service.findAllForDashboard('tenant-1', 'dash-1');
      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundException when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.findAllForDashboard('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePosition', () => {
    it('should update widget position', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'w-1', positionX: 0, positionY: 0, width: 4, height: 3, name: 'W', config: '{}',
        dashboard: { tenantId: 'tenant-1' },
      });
      prisma.widget.update.mockResolvedValue({ id: 'w-1', positionX: 2, positionY: 3 });

      const result = await service.updatePosition('tenant-1', 'w-1', { positionX: 2, positionY: 3 });
      expect(result.positionX).toBe(2);
    });

    it('should throw NotFoundException for missing widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);
      await expect(service.updatePosition('tenant-1', 'missing', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for wrong tenant widget', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'w-1', dashboard: { tenantId: 'other-tenant' },
      });
      await expect(service.updatePosition('tenant-1', 'w-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'w-1', dashboard: { tenantId: 'tenant-1' },
      });
      prisma.widget.delete.mockResolvedValue({ id: 'w-1' });

      const result = await service.remove('tenant-1', 'w-1');
      expect(result.id).toBe('w-1');
    });

    it('should throw NotFoundException for missing widget on remove', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);
      await expect(service.remove('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for wrong tenant on remove', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'w-1', dashboard: { tenantId: 'other-tenant' },
      });
      await expect(service.remove('tenant-1', 'w-1')).rejects.toThrow(NotFoundException);
    });
  });
});
