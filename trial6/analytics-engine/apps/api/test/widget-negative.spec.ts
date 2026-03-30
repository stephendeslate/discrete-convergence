// TRACED:AE-WID-002 — Negative and edge case tests for widget CRUD
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from '../src/widget/widget.service';
import { createMockPrismaService, createTestWidget, createTestDashboard, TEST_TENANT_ID } from './helpers/setup';

describe('WidgetService — negative and edge cases', () => {
  let service: WidgetService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    service = new WidgetService(mockPrisma as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create — negative cases', () => {
    it('should throw NotFoundException when dashboard does not exist', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(
        service.create(TEST_TENANT_ID, {
          type: 'BAR',
          title: 'Test',
          dashboardId: 'nonexistent-dash',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.widget.create).not.toHaveBeenCalled();
    });

    it('should prevent widget creation on another tenants dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'other-tenant' }),
      );

      await expect(
        service.create(TEST_TENANT_ID, {
          type: 'PIE',
          title: 'Stolen',
          dashboardId: 'dash-1',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.widget.create).not.toHaveBeenCalled();
    });

    it('should include dashboard ID in error message', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(
        service.create(TEST_TENANT_ID, {
          type: 'LINE',
          title: 'Test',
          dashboardId: 'dash-404',
        }),
      ).rejects.toThrow('Dashboard dash-404 not found');
    });
  });

  describe('create — edge cases', () => {
    it('should handle all widget type values', async () => {
      const types = ['LINE', 'BAR', 'PIE', 'AREA', 'KPI', 'TABLE', 'FUNNEL'];

      for (const type of types) {
        mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
        mockPrisma.widget.create.mockResolvedValue(createTestWidget({ type }));

        const result = await service.create(TEST_TENANT_ID, {
          type,
          title: `${type} Chart`,
          dashboardId: 'dash-1',
        });

        expect(result.type).toBe(type);
      }
    });

    it('should store complex nested config as JSON', async () => {
      const complexConfig = {
        axes: { x: { label: 'Time' }, y: { label: 'Revenue', min: 0 } },
        colors: ['#FF0000', '#00FF00'],
        legend: { position: 'bottom' },
      };

      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.widget.create.mockResolvedValue(
        createTestWidget({ config: complexConfig }),
      );

      await service.create(TEST_TENANT_ID, {
        type: 'LINE',
        title: 'Revenue',
        dashboardId: 'dash-1',
        config: complexConfig,
      });

      const createArg = mockPrisma.widget.create.mock.calls[0][0];
      expect(createArg.data.config).toEqual(complexConfig);
    });
  });

  describe('findAll — negative cases', () => {
    it('should throw when dashboard does not exist for listing', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.findAll(TEST_TENANT_ID, 'nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw when dashboard belongs to different tenant', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'other-tenant' }),
      );

      await expect(service.findAll(TEST_TENANT_ID, 'dash-1'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('findAll — edge cases', () => {
    it('should return empty array when dashboard has no widgets', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.widget.findMany.mockResolvedValue([]);
      mockPrisma.widget.count.mockResolvedValue(0);

      const result = await service.findAll(TEST_TENANT_ID, 'dash-1');

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne — negative cases', () => {
    it('should throw when widget does not exist', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.findOne(TEST_TENANT_ID, 'widget-404'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw when widgets parent dashboard belongs to other tenant', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(
        createTestWidget({ dashboardId: 'dash-1' }),
      );
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'other-tenant' }),
      );

      await expect(service.findOne(TEST_TENANT_ID, 'widget-1'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update — negative cases', () => {
    it('should throw when updating non-existent widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);

      await expect(
        service.update(TEST_TENANT_ID, 'widget-404', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.widget.update).not.toHaveBeenCalled();
    });

    it('should not update when tenant check fails', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(
        createTestWidget({ dashboardId: 'dash-1' }),
      );
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'other-tenant' }),
      );

      await expect(
        service.update(TEST_TENANT_ID, 'widget-1', { title: 'Hijack' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.widget.update).not.toHaveBeenCalled();
    });
  });

  describe('remove — negative cases', () => {
    it('should throw when deleting non-existent widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.remove(TEST_TENANT_ID, 'widget-404'))
        .rejects
        .toThrow(NotFoundException);

      expect(mockPrisma.widget.delete).not.toHaveBeenCalled();
    });

    it('should prevent cross-tenant widget deletion', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(
        createTestWidget({ dashboardId: 'dash-1' }),
      );
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'victim-tenant' }),
      );

      await expect(service.remove(TEST_TENANT_ID, 'widget-1'))
        .rejects
        .toThrow(NotFoundException);

      expect(mockPrisma.widget.delete).not.toHaveBeenCalled();
    });
  });
});
