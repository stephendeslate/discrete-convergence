import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from '../src/widget/widget.service';
import { PrismaService } from '../src/infra/prisma.service';

// TRACED: AE-WIDGET-003
describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: PrismaService;

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  const dashboardId = '770e8400-e29b-41d4-a716-446655440002';

  const mockWidget = {
    id: '990e8400-e29b-41d4-a716-446655440004',
    title: 'Revenue Chart',
    type: 'CHART',
    config: '{}',
    position: 0,
    tenantId,
    dashboardId,
    dataSourceId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    dashboard: { id: dashboardId, title: 'Test Dashboard' },
    dataSource: null,
  };

  const mockWidgets = [mockWidget];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        {
          provide: PrismaService,
          useValue: {
            widget: {
              create: jest.fn().mockResolvedValue(mockWidget),
              findMany: jest.fn().mockResolvedValue(mockWidgets),
              findUnique: jest.fn().mockResolvedValue(mockWidget),
              update: jest.fn().mockResolvedValue({ ...mockWidget, title: 'Updated' }),
              delete: jest.fn().mockResolvedValue(mockWidget),
              count: jest.fn().mockResolvedValue(1),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a widget with tenant isolation', async () => {
      const result = await service.create(tenantId, {
        title: 'Revenue Chart',
        type: 'CHART',
        dashboardId,
      });

      expect(result.title).toBe('Revenue Chart');
      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId, dashboardId }),
        }),
      );
    });

    it('should default config to empty object and position to 0', async () => {
      await service.create(tenantId, {
        title: 'Test',
        type: 'TABLE',
        dashboardId,
      });

      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ config: '{}', position: 0 }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated widgets for tenant', async () => {
      const result = await service.findAll(tenantId);

      expect(result.items).toEqual(mockWidgets);
      expect(result.total).toBe(1);
      expect(prisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });

    it('should apply pagination parameters', async () => {
      await service.findAll(tenantId, '3', '25');

      expect(prisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 50,
          take: 25,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a widget by id within tenant', async () => {
      const result = await service.findOne(tenantId, mockWidget.id);

      expect(result.id).toBe(mockWidget.id);
      expect(prisma.widget.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockWidget.id },
        }),
      );
    });

    it('should throw NotFoundException for non-existent widget', async () => {
      (prisma.widget.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.widget.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'nonexistent' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      (prisma.widget.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockWidget,
        tenantId: 'different-tenant',
      });

      await expect(service.findOne(tenantId, mockWidget.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update widget title', async () => {
      (prisma.widget.findUnique as jest.Mock).mockResolvedValueOnce(mockWidget);

      const result = await service.update(tenantId, mockWidget.id, {
        title: 'Updated Widget',
      });

      expect(result.title).toBeDefined();
      expect(prisma.widget.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockWidget.id },
        }),
      );
    });

    it('should update widget position', async () => {
      (prisma.widget.findUnique as jest.Mock).mockResolvedValueOnce(mockWidget);

      await service.update(tenantId, mockWidget.id, { position: 5 });

      expect(prisma.widget.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 5 }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      (prisma.widget.findUnique as jest.Mock).mockResolvedValueOnce(mockWidget);

      await service.remove(tenantId, mockWidget.id);

      expect(prisma.widget.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockWidget.id } }),
      );
    });

    it('should throw NotFoundException when deleting non-existent widget', async () => {
      (prisma.widget.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
