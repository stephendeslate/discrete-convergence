// TRACED:AE-DASH-002 — Negative and edge case tests for dashboard CRUD
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { createMockPrismaService, createTestDashboard, TEST_TENANT_ID } from './helpers/setup';

describe('DashboardService — negative and edge cases', () => {
  let service: DashboardService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    service = new DashboardService(mockPrisma as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create — edge cases', () => {
    it('should accept maximum length title (255 chars)', async () => {
      const longTitle = 'A'.repeat(255);
      mockPrisma.dashboard.create.mockResolvedValue(
        createTestDashboard({ title: longTitle }),
      );

      const result = await service.create(TEST_TENANT_ID, { title: longTitle });
      expect(result.title).toBe(longTitle);
    });

    it('should accept empty description', async () => {
      mockPrisma.dashboard.create.mockResolvedValue(
        createTestDashboard({ description: '' }),
      );

      await service.create(TEST_TENANT_ID, { title: 'Test', description: '' });

      const createArg = mockPrisma.dashboard.create.mock.calls[0][0];
      expect(createArg.data.description).toBe('');
    });

    it('should accept all valid status values', async () => {
      for (const status of ['DRAFT', 'PUBLISHED', 'ARCHIVED']) {
        mockPrisma.dashboard.create.mockResolvedValue(
          createTestDashboard({ status }),
        );

        await service.create(TEST_TENANT_ID, { title: 'Test', status });

        const call = mockPrisma.dashboard.create.mock.calls.pop();
        expect(call?.[0].data.status).toBe(status);
      }
    });
  });

  describe('findAll — edge cases', () => {
    it('should return empty data array when no dashboards exist', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll(TEST_TENANT_ID, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should handle single item matching exactly one page', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([createTestDashboard()]);
      mockPrisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll(TEST_TENANT_ID, 1, 1);

      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should correctly calculate totalPages for boundary count', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(100);

      const result = await service.findAll(TEST_TENANT_ID, 1, 10);

      // Exactly 100 / 10 = 10 pages (no remainder)
      expect(result.meta.totalPages).toBe(10);
    });

    it('should correctly calculate totalPages with remainder', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(101);

      const result = await service.findAll(TEST_TENANT_ID, 1, 10);

      // ceil(101 / 10) = 11 pages
      expect(result.meta.totalPages).toBe(11);
    });
  });

  describe('findOne — negative cases', () => {
    it('should throw NotFoundException for null result (non-existent ID)', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.findOne(TEST_TENANT_ID, 'nonexistent-uuid'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when dashboard belongs to different tenant', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'attacker-tenant' }),
      );

      await expect(service.findOne(TEST_TENANT_ID, 'dash-1'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should include dashboard ID in error message', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.findOne(TEST_TENANT_ID, 'dash-999'))
        .rejects
        .toThrow('Dashboard dash-999 not found');
    });
  });

  describe('update — negative cases', () => {
    it('should throw NotFoundException when updating non-existent dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(
        service.update(TEST_TENANT_ID, 'nonexistent', { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);

      // Update should never be called
      expect(mockPrisma.dashboard.update).not.toHaveBeenCalled();
    });

    it('should not call update when ownership check fails', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'other-tenant' }),
      );

      await expect(
        service.update(TEST_TENANT_ID, 'dash-1', { title: 'Hijack' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.dashboard.update).not.toHaveBeenCalled();
    });

    it('should produce empty data object when no fields provided', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.dashboard.update.mockResolvedValue(createTestDashboard());

      await service.update(TEST_TENANT_ID, 'dash-1', {});

      const updateArg = mockPrisma.dashboard.update.mock.calls[0][0];
      // All spread expressions with undefined produce empty object
      expect(Object.keys(updateArg.data)).toHaveLength(0);
    });
  });

  describe('remove — negative cases', () => {
    it('should throw NotFoundException when removing non-existent dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.remove(TEST_TENANT_ID, 'nonexistent'))
        .rejects
        .toThrow(NotFoundException);

      expect(mockPrisma.dashboard.delete).not.toHaveBeenCalled();
    });

    it('should prevent cross-tenant deletion', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'victim-tenant' }),
      );

      await expect(service.remove(TEST_TENANT_ID, 'dash-1'))
        .rejects
        .toThrow(NotFoundException);

      expect(mockPrisma.dashboard.delete).not.toHaveBeenCalled();
    });
  });
});
