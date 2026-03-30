import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/infra/prisma.service';

// TRACED: AE-DASH-004
describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '660e8400-e29b-41d4-a716-446655440001';

  const mockDashboard = {
    id: '770e8400-e29b-41d4-a716-446655440002',
    title: 'Test Dashboard',
    description: 'Test',
    status: 'DRAFT',
    tenantId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    widgets: [],
    user: { id: userId, name: 'Test', email: 'test@test.com' },
  };

  const mockDashboards = [mockDashboard];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: {
            dashboard: {
              create: jest.fn().mockResolvedValue(mockDashboard),
              findMany: jest.fn().mockResolvedValue(mockDashboards),
              findUnique: jest.fn().mockResolvedValue(mockDashboard),
              update: jest.fn().mockResolvedValue({ ...mockDashboard, title: 'Updated' }),
              delete: jest.fn().mockResolvedValue(mockDashboard),
              count: jest.fn().mockResolvedValue(1),
            },
            $executeRaw: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a dashboard with tenant isolation', async () => {
      const result = await service.create(tenantId, userId, {
        title: 'Test Dashboard',
        description: 'Test',
      });

      expect(result.title).toBe('Test Dashboard');
      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId, userId }),
        }),
      );
    });

    it('should default status to DRAFT', async () => {
      await service.create(tenantId, userId, { title: 'Test' });

      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards for tenant', async () => {
      const result = await service.findAll(tenantId);

      expect(result.items).toEqual(mockDashboards);
      expect(result.total).toBe(1);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });

    it('should apply pagination parameters', async () => {
      await service.findAll(tenantId, '2', '10');

      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id within tenant', async () => {
      const result = await service.findOne(tenantId, mockDashboard.id);

      expect(result.id).toBe(mockDashboard.id);
      expect(prisma.dashboard.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockDashboard.id },
        }),
      );
    });

    it('should throw NotFoundException for non-existent dashboard', async () => {
      (prisma.dashboard.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dashboard.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'nonexistent' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      (prisma.dashboard.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDashboard,
        tenantId: 'different-tenant',
      });

      await expect(service.findOne(tenantId, mockDashboard.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update dashboard title', async () => {
      (prisma.dashboard.findUnique as jest.Mock).mockResolvedValueOnce(mockDashboard);

      const result = await service.update(tenantId, mockDashboard.id, {
        title: 'Updated',
      });

      expect(result.title).toBeDefined();
      expect(prisma.dashboard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockDashboard.id },
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      (prisma.dashboard.findUnique as jest.Mock).mockResolvedValueOnce(mockDashboard);

      await service.remove(tenantId, mockDashboard.id);

      expect(prisma.dashboard.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: mockDashboard.id } }),
      );
    });

    it('should throw NotFoundException when deleting non-existent dashboard', async () => {
      (prisma.dashboard.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    it('should execute raw SQL for stats', async () => {
      const result = await service.getStats(tenantId);

      expect(result).toHaveProperty('count');
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
