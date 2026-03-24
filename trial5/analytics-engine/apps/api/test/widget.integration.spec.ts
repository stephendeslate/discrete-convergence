import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from '../src/widget/widget.service';
import { PrismaService } from '../src/common/prisma.service';

describe('WidgetService', () => {
  let service: WidgetService;

  const mockDashboard = {
    id: 'dash-1',
    tenantId: 'tenant-1',
    title: 'Test Dashboard',
    status: 'PUBLISHED',
  };

  const mockWidget = {
    id: 'widget-1',
    type: 'LINE',
    title: 'Revenue Chart',
    config: { yAxis: 'revenue' },
    dashboardId: 'dash-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    dashboard: {
      findUnique: jest.fn(),
    },
    widget: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should verify dashboard ownership before creating widget', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        ...mockDashboard,
        tenantId: 'other-tenant',
      });

      await expect(
        service.create('tenant-1', { type: 'BAR', title: 'Chart', dashboardId: 'dash-1' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.widget.create).not.toHaveBeenCalled();
    });

    it('should create widget when dashboard belongs to tenant', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      mockPrisma.widget.create.mockResolvedValue(mockWidget);

      const result = await service.create('tenant-1', {
        type: 'LINE',
        title: 'Revenue Chart',
        dashboardId: 'dash-1',
        config: { yAxis: 'revenue' },
      });

      expect(result.type).toBe('LINE');
      const createCall = mockPrisma.widget.create.mock.calls[0][0];
      expect(createCall.data.dashboardId).toBe('dash-1');
    });
  });

  describe('findAll', () => {
    it('should verify dashboard ownership before listing widgets', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.findAll('tenant-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should return paginated widgets with computed totalPages', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      mockPrisma.widget.findMany.mockResolvedValue([mockWidget]);
      mockPrisma.widget.count.mockResolvedValue(15);

      const result = await service.findAll('tenant-1', 'dash-1', 1, 10);

      expect(result.meta.totalPages).toBe(2); // ceil(15/10)
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should verify tenant through dashboard relationship', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({
        ...mockWidget,
        dashboard: mockDashboard,
      });
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        ...mockDashboard,
        tenantId: 'wrong-tenant',
      });

      await expect(service.findOne('tenant-1', 'widget-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should only update explicitly provided fields', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({
        ...mockWidget,
        dashboard: mockDashboard,
      });
      mockPrisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      mockPrisma.widget.update.mockResolvedValue({ ...mockWidget, title: 'Updated' });

      await service.update('tenant-1', 'widget-1', { title: 'Updated' });

      const updateCall = mockPrisma.widget.update.mock.calls[0][0];
      expect(updateCall.data).toHaveProperty('title');
      expect(updateCall.data).not.toHaveProperty('type');
      expect(updateCall.data).not.toHaveProperty('config');
    });
  });
});
