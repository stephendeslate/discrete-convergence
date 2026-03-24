import { NotFoundException } from '@nestjs/common';
import { WidgetService } from '../src/widget/widget.service';
import { createMockPrismaService, createTestWidget, createTestDashboard, TEST_TENANT_ID } from './helpers/setup';

describe('WidgetService', () => {
  let service: WidgetService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    service = new WidgetService(mockPrisma as never);
  });

  describe('create', () => {
    it('should verify dashboard ownership before creating widget', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.widget.create.mockResolvedValue(createTestWidget());

      const result = await service.create(TEST_TENANT_ID, {
        type: 'LINE',
        title: 'Revenue Chart',
        dashboardId: 'dash-1',
      });

      // Dashboard ownership check happened
      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
      // Widget was created with the correct dashboard reference
      const createArg = mockPrisma.widget.create.mock.calls[0][0];
      expect(createArg.data.dashboardId).toBe('dash-1');
      expect(result.type).toBe('LINE');
    });

    it('should reject widget creation for dashboard in different tenant', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'other-tenant' }),
      );

      await expect(
        service.create(TEST_TENANT_ID, {
          type: 'BAR',
          title: 'Test',
          dashboardId: 'dash-other',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should default config to empty object', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.widget.create.mockResolvedValue(createTestWidget({ config: {} }));

      await service.create(TEST_TENANT_ID, {
        type: 'KPI',
        title: 'Metric',
        dashboardId: 'dash-1',
      });

      const createArg = mockPrisma.widget.create.mock.calls[0][0];
      expect(createArg.data.config).toEqual({});
    });
  });

  describe('findAll', () => {
    it('should verify dashboard tenant before listing widgets', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.widget.findMany.mockResolvedValue([createTestWidget()]);
      mockPrisma.widget.count.mockResolvedValue(1);

      const result = await service.findAll(TEST_TENANT_ID, 'dash-1');

      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should reject listing for dashboard in different tenant', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'other-tenant' }),
      );

      await expect(service.findAll(TEST_TENANT_ID, 'dash-1'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should verify tenant ownership through dashboard chain', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(createTestWidget());
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());

      const result = await service.findOne(TEST_TENANT_ID, 'widget-1');

      expect(result.id).toBe('widget-1');
      // Verified both widget lookup and dashboard ownership check
      expect(mockPrisma.widget.findUnique).toHaveBeenCalled();
      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalled();
    });

    it('should throw when widget does not exist', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.findOne(TEST_TENANT_ID, 'nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should apply partial widget updates', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(createTestWidget());
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.widget.update.mockResolvedValue(createTestWidget({ title: 'Updated Chart' }));

      const result = await service.update(TEST_TENANT_ID, 'widget-1', { title: 'Updated Chart' });

      const updateArg = mockPrisma.widget.update.mock.calls[0][0];
      expect(updateArg.data).toHaveProperty('title', 'Updated Chart');
      expect(updateArg.data).not.toHaveProperty('type');
      expect(result.title).toBe('Updated Chart');
    });
  });

  describe('remove', () => {
    it('should verify ownership then delete', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(createTestWidget());
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.widget.delete.mockResolvedValue(createTestWidget());

      await service.remove(TEST_TENANT_ID, 'widget-1');

      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'widget-1' } });
    });
  });
});
