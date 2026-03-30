// TRACED:DASH-SVC-TEST — Dashboard service tests
import { DashboardService } from './dashboard.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    widget: { count: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      dashboard: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      widget: { count: jest.fn().mockResolvedValue(0) },
    };
    service = new DashboardService(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated dashboards', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);
      const result = await service.findAll('tenant-1', 1, 10);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', name: 'Test' });
      const result = await service.findOne('1', 'tenant-1');
      expect(result.name).toBe('Test');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.findOne('999', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      prisma.dashboard.create.mockResolvedValue({ id: '1', name: 'New' });
      const result = await service.create(
        { name: 'New' },
        'user-1',
        'tenant-1',
      );
      expect(result.name).toBe('New');
      expect(result.id).toBe('1');
      expect(prisma.dashboard.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update own dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: '1',
        userId: 'user-1',
        tenantId: 'tenant-1',
      });
      prisma.dashboard.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update(
        '1',
        { name: 'Updated' },
        'user-1',
        'tenant-1',
        'EDITOR',
      );
      expect(result.name).toBe('Updated');
    });

    it('should reject update by non-owner non-admin', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: '1',
        userId: 'other-user',
        tenantId: 'tenant-1',
      });
      await expect(
        service.update('1', { name: 'X' }, 'user-1', 'tenant-1', 'EDITOR'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getData', () => {
    it('should return data without widgets', async () => {
      prisma.dashboard.count.mockResolvedValue(5);
      const result = await service.getData('tenant-1', false);
      expect(result.totalDashboards).toBe(5);
      expect(result.widgets).toBeUndefined();
    });

    it('should return data with widgets', async () => {
      prisma.dashboard.count.mockResolvedValue(5);
      prisma.widget.count.mockResolvedValue(10);
      const result = await service.getData('tenant-1', true);
      expect(result.widgets).toBe(10);
    });
  });
});
