import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WidgetType } from '@analytics-engine/shared';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.service';

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: {
    dashboard: { findFirst: jest.Mock };
    widget: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: { findFirst: jest.fn() },
      widget: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
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
    it('should create a widget', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', tenantId: 'tenant-1' });
      prisma.widget.count.mockResolvedValue(0);
      prisma.widget.create.mockResolvedValue({
        id: 'widget-1',
        name: 'Revenue Chart',
        type: WidgetType.LINE_CHART,
      });

      const result = await service.create('tenant-1', 'dash-1', {
        name: 'Revenue Chart',
        type: WidgetType.LINE_CHART,
      });
      expect(result.name).toBe('Revenue Chart');
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.create('tenant-1', 'nonexistent', {
          name: 'Widget',
          type: WidgetType.BAR_CHART,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when widget limit exceeded', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', tenantId: 'tenant-1' });
      prisma.widget.count.mockResolvedValue(20);

      await expect(
        service.create('tenant-1', 'dash-1', {
          name: 'Widget',
          type: WidgetType.BAR_CHART,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getWidgetData', () => {
    it('should return widget data when data source is active', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'widget-1',
        dataSource: { id: 'ds-1', status: 'ACTIVE' },
      });

      const result = await service.getWidgetData('tenant-1', 'widget-1');
      expect(result.widgetId).toBe('widget-1');
      expect(result.data).toHaveLength(3);
    });

    it('should throw NotFoundException for nonexistent widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(
        service.getWidgetData('tenant-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty data when no data source', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'widget-1',
        dataSource: null,
      });

      const result = await service.getWidgetData('tenant-1', 'widget-1');
      expect(result.data).toHaveLength(0);
    });

    it('should throw BadRequestException when data source is paused', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: 'widget-1',
        dataSource: { id: 'ds-1', status: 'PAUSED' },
      });

      await expect(
        service.getWidgetData('tenant-1', 'widget-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      prisma.widget.findFirst.mockResolvedValue({ id: 'widget-1' });
      prisma.widget.delete.mockResolvedValue({ id: 'widget-1' });

      const result = await service.remove('tenant-1', 'widget-1');
      expect(result.id).toBe('widget-1');
    });

    it('should throw NotFoundException for nonexistent widget', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('tenant-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
