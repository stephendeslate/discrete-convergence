import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from '../src/dashboard/dashboard.controller';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string; tenantId: string; role: string };
}

function mockReq(overrides: Partial<AuthenticatedRequest['user']> = {}): AuthenticatedRequest {
  return {
    user: {
      userId: 'user-1',
      tenantId: 'tenant-1',
      role: 'USER',
      ...overrides,
    },
  } as AuthenticatedRequest;
}

describe('Dashboard Integration (Controller → Service → Prisma)', () => {
  let controller: DashboardController;
  let prisma: {
    dashboard: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  describe('create → findOne flow', () => {
    it('should create a dashboard with tenant scoping', async () => {
      const created = { id: 'dash-1', title: 'Sales', tenantId: 'tenant-1', status: 'DRAFT' };
      prisma.dashboard.create.mockResolvedValue(created);

      const result = await controller.create(mockReq(), { title: 'Sales' });

      expect(result).toEqual(created);
      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Sales',
            tenantId: 'tenant-1',
            createdById: 'user-1',
          }),
        }),
      );
    });
  });

  describe('findAll with pagination', () => {
    it('should return paginated dashboard list', async () => {
      prisma.dashboard.findMany.mockResolvedValue([
        { id: 'dash-1', title: 'Sales' },
        { id: 'dash-2', title: 'Marketing' },
      ]);
      prisma.dashboard.count.mockResolvedValue(2);

      const result = await controller.findAll(mockReq(), { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should return empty paginated result when no dashboards', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const result = await controller.findAll(mockReq(), { page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return dashboard for valid tenant and id', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', tenantId: 'tenant-1', title: 'Test' });

      const result = await controller.findOne(mockReq(), 'dash-1');
      expect(result.id).toBe('dash-1');
      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'dash-1', tenantId: 'tenant-1' } }),
      );
    });

    it('should throw NotFoundException when dashboard does not exist', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(controller.findOne(mockReq(), 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update dashboard title', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', tenantId: 'tenant-1' });
      prisma.dashboard.update.mockResolvedValue({ id: 'dash-1', title: 'Updated Title' });

      const result = await controller.update(mockReq(), 'dash-1', { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when updating nonexistent dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        controller.update(mockReq(), 'bad-id', { title: 'Nope' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', tenantId: 'tenant-1' });
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      await controller.remove(mockReq(), 'dash-1');
      expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
    });

    it('should throw NotFoundException when deleting nonexistent dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(controller.remove(mockReq(), 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish lifecycle', () => {
    it('should publish a DRAFT dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', status: 'DRAFT', tenantId: 'tenant-1' });
      prisma.dashboard.update.mockResolvedValue({ id: 'dash-1', status: 'PUBLISHED' });

      const result = await controller.publish(mockReq(), 'dash-1');
      expect(result.status).toBe('PUBLISHED');
    });

    it('should reject publishing a non-DRAFT dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', status: 'PUBLISHED', tenantId: 'tenant-1' });

      await expect(controller.publish(mockReq(), 'dash-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('archive lifecycle', () => {
    it('should archive a PUBLISHED dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', status: 'PUBLISHED', tenantId: 'tenant-1' });
      prisma.dashboard.update.mockResolvedValue({ id: 'dash-1', status: 'ARCHIVED' });

      const result = await controller.archive(mockReq(), 'dash-1');
      expect(result.status).toBe('ARCHIVED');
    });

    it('should reject archiving a DRAFT dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', status: 'DRAFT', tenantId: 'tenant-1' });

      await expect(controller.archive(mockReq(), 'dash-1')).rejects.toThrow(BadRequestException);
    });
  });
});
