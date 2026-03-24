import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { createMockPrismaService, createTestDashboard, TEST_TENANT_ID } from './helpers/setup';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    service = new DashboardService(mockPrisma as never);
  });

  describe('create', () => {
    it('should associate dashboard with the provided tenantId', async () => {
      const created = createTestDashboard();
      mockPrisma.dashboard.create.mockResolvedValue(created);

      const result = await service.create(TEST_TENANT_ID, { title: 'New Dashboard' });

      // Assert the tenantId was passed through to the data layer
      const createArg = mockPrisma.dashboard.create.mock.calls[0][0];
      expect(createArg.data.tenantId).toBe(TEST_TENANT_ID);
      // Assert the result has the expected tenant association
      expect(result.tenantId).toBe(TEST_TENANT_ID);
    });

    it('should default status to DRAFT when not provided', async () => {
      const created = createTestDashboard({ status: 'DRAFT' });
      mockPrisma.dashboard.create.mockResolvedValue(created);

      await service.create(TEST_TENANT_ID, { title: 'Test' });

      const createArg = mockPrisma.dashboard.create.mock.calls[0][0];
      expect(createArg.data.status).toBe('DRAFT');
    });
  });

  describe('findAll', () => {
    it('should compute totalPages from total and limit', async () => {
      const dashboards = Array.from({ length: 5 }, (_, i) =>
        createTestDashboard({ id: `dash-${i}` }),
      );
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);
      mockPrisma.dashboard.count.mockResolvedValue(23);

      const result = await service.findAll(TEST_TENANT_ID, 1, 5);

      // totalPages = ceil(23 / 5) = 5
      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.total).toBe(23);
      expect(result.data).toHaveLength(5);
    });

    it('should filter by tenantId in the where clause', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      await service.findAll(TEST_TENANT_ID);

      const findManyArg = mockPrisma.dashboard.findMany.mock.calls[0][0];
      expect(findManyArg.where.tenantId).toBe(TEST_TENANT_ID);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when dashboard belongs to different tenant', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(
        createTestDashboard({ tenantId: 'other-tenant' }),
      );

      await expect(service.findOne(TEST_TENANT_ID, 'dash-1'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when dashboard does not exist', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.findOne(TEST_TENANT_ID, 'nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should return dashboard when tenant matches', async () => {
      const dashboard = createTestDashboard();
      mockPrisma.dashboard.findUnique.mockResolvedValue(dashboard);

      const result = await service.findOne(TEST_TENANT_ID, 'dash-1');

      expect(result.id).toBe('dash-1');
      expect(result.title).toBe('Test Dashboard');
    });
  });

  describe('update', () => {
    it('should only include provided fields in the update data', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.dashboard.update.mockResolvedValue(
        createTestDashboard({ title: 'Updated' }),
      );

      await service.update(TEST_TENANT_ID, 'dash-1', { title: 'Updated' });

      const updateArg = mockPrisma.dashboard.update.mock.calls[0][0];
      expect(updateArg.data).toHaveProperty('title', 'Updated');
      // description was not provided, so should not be in data
      expect(updateArg.data).not.toHaveProperty('description');
    });
  });

  describe('remove', () => {
    it('should verify ownership before deleting', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(createTestDashboard());
      mockPrisma.dashboard.delete.mockResolvedValue(createTestDashboard());

      await service.remove(TEST_TENANT_ID, 'dash-1');

      // Verify findUnique was called (ownership check) before delete
      expect(mockPrisma.dashboard.findUnique).toHaveBeenCalled();
      expect(mockPrisma.dashboard.delete).toHaveBeenCalled();
      // findUnique invocation order < delete invocation order
      const findOrder = mockPrisma.dashboard.findUnique.mock.invocationCallOrder[0];
      const deleteOrder = mockPrisma.dashboard.delete.mock.invocationCallOrder[0];
      expect(findOrder).toBeLessThan(deleteOrder);
    });

    it('should throw NotFoundException when deleting non-existent dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);

      await expect(service.remove(TEST_TENANT_ID, 'nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
