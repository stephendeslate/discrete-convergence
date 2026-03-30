// TRACED:WIDGET-SVC-TEST — Widget service tests
import { WidgetService } from './widget.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: {
    widget: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    dashboard: { findFirst: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      widget: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      dashboard: { findFirst: jest.fn() },
    };
    service = new WidgetService(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated widgets', async () => {
      const result = await service.findAll('tenant-1', 1, 10);
      expect(result.data).toEqual([]);
      expect(result.meta).toBeDefined();
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a widget', async () => {
      prisma.widget.findFirst.mockResolvedValue({ id: '1', title: 'W1' });
      const result = await service.findOne('1', 'tenant-1');
      expect(result.title).toBe('W1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);
      await expect(service.findOne('999', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create widget when dashboard exists', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1' });
      prisma.widget.create.mockResolvedValue({ id: 'w1', title: 'New' });
      const result = await service.create(
        { title: 'New', type: 'chart', dashboardId: 'd1' },
        'tenant-1',
      );
      expect(result.title).toBe('New');
      expect(prisma.widget.create).toHaveBeenCalledTimes(1);
    });

    it('should throw if dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(
        service.create(
          { title: 'New', type: 'chart', dashboardId: 'bad' },
          'tenant-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWidgetData', () => {
    it('should return chart data', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: '1',
        type: 'chart',
        config: {},
        title: 'Chart',
      });
      const result = await service.getWidgetData('1', 'tenant-1');
      expect(result['type']).toBe('chart');
      expect(result['labels']).toBeDefined();
    });

    it('should return table data', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: '1',
        type: 'table',
        config: {},
        title: 'Table',
      });
      const result = await service.getWidgetData('1', 'tenant-1');
      expect(result['type']).toBe('table');
      expect(result['columns']).toBeDefined();
    });

    it('should throw for unsupported type', async () => {
      prisma.widget.findFirst.mockResolvedValue({
        id: '1',
        type: 'unknown',
        config: {},
        title: 'X',
      });
      await expect(service.getWidgetData('1', 'tenant-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
