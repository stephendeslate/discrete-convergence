// TRACED:AE-TEST-008 — Dashboard service unit tests with mocked Prisma
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from '../dashboard.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  dashboard: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardService(mockPrisma as never);
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const expected = { id: 'd-1', title: 'Test', status: 'DRAFT', widgets: [] };
      mockPrisma.dashboard.create.mockResolvedValue(expected);

      const result = await service.create({ title: 'Test' }, 'tenant-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 10);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 500);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('d-1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return dashboard with widgets', async () => {
      const expected = { id: 'd-1', title: 'Test', widgets: [], embedConfig: null };
      mockPrisma.dashboard.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('d-1', 'tenant-1');
      expect(result).toEqual(expected);
    });
  });

  describe('publish', () => {
    it('should publish a DRAFT dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'd-1',
        status: 'DRAFT',
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'd-1',
        status: 'PUBLISHED',
        widgets: [],
      });

      const result = await service.publish('d-1', 'tenant-1');
      expect(result.status).toBe('PUBLISHED');
    });

    it('should reject publishing non-DRAFT dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'd-1',
        status: 'PUBLISHED',
      });

      await expect(service.publish('d-1', 'tenant-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('archive', () => {
    it('should archive a PUBLISHED dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'd-1',
        status: 'PUBLISHED',
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'd-1',
        status: 'ARCHIVED',
        widgets: [],
      });

      const result = await service.archive('d-1', 'tenant-1');
      expect(result.status).toBe('ARCHIVED');
    });

    it('should reject archiving non-PUBLISHED dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'd-1',
        status: 'DRAFT',
      });

      await expect(service.archive('d-1', 'tenant-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
