// TRACED:TEST-WIDGET-SERVICE — Unit tests for WidgetService
import { Test, TestingModule } from '@nestjs/testing';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.module';
import { NotFoundException } from '@nestjs/common';

const tenantId = '00000000-0000-0000-0000-000000000001';
const dashboardId = '00000000-0000-0000-0000-000000000002';
const widgetId = '00000000-0000-0000-0000-000000000003';

const mockWidget = {
  id: widgetId,
  title: 'Revenue Chart',
  type: 'line-chart',
  config: {},
  position: 0,
  dashboardId,
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  widget: {
    create: jest.fn().mockResolvedValue(mockWidget),
    findMany: jest.fn().mockResolvedValue([mockWidget]),
    findFirst: jest.fn().mockResolvedValue(mockWidget),
    count: jest.fn().mockResolvedValue(1),
    update: jest.fn().mockResolvedValue({ ...mockWidget, title: 'Updated' }),
    delete: jest.fn().mockResolvedValue(mockWidget),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  describe('create', () => {
    it('should create a widget with tenant scoping', async () => {
      const result = await service.create(
        { title: 'New', type: 'bar-chart', dashboardId },
        tenantId,
      );
      expect(result).toHaveProperty('id');
      expect(mockPrisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId }),
        }),
      );
    });
  });

  describe('findByDashboard', () => {
    it('should return paginated results for a dashboard', async () => {
      const result = await service.findByDashboard(dashboardId, tenantId);
      expect(result).toHaveProperty('data');
      expect(result.meta).toHaveProperty('total');
    });
  });

  describe('findOne', () => {
    it('should return a widget by id', async () => {
      const result = await service.findOne(widgetId, tenantId);
      expect(result.id).toBe(widgetId);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValueOnce(null);
      await expect(service.findOne('nonexistent', tenantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update widget title', async () => {
      const result = await service.update(widgetId, { title: 'Updated' }, tenantId);
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete the widget', async () => {
      await service.remove(widgetId, tenantId);
      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({ where: { id: widgetId } });
    });
  });
});
