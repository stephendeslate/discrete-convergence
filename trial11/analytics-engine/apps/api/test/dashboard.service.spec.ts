import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/common/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  const prisma = {
    dashboard: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const dto = { name: 'Test Dashboard', description: 'Test' };
      const expected = { id: 'd-1', ...dto, userId: 'u-1', tenantId: 't-1', widgets: [] };
      prisma.dashboard.create.mockResolvedValue(expected);

      const result = await service.create(dto, 'u-1', 't-1');

      expect(result).toEqual(expected);
      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Dashboard',
          description: 'Test',
          isPublic: false,
          userId: 'u-1',
          tenantId: 't-1',
        },
        include: { widgets: true },
      });
    });

    it('should create a public dashboard when isPublic is true', async () => {
      const dto = { name: 'Public Dashboard', isPublic: true };
      prisma.dashboard.create.mockResolvedValue({ id: 'd-2', ...dto, widgets: [] });

      await service.create(dto, 'u-1', 't-1');

      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isPublic: true }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const mockDashboards = [{ id: 'd-1', name: 'D1' }];
      prisma.dashboard.findMany.mockResolvedValue(mockDashboards);
      prisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('t-1', '1', '10');

      expect(result.data).toEqual(mockDashboards);
      expect(result.total).toBe(1);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 't-1' },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should use default pagination when no params given', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('t-1');

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id and tenantId', async () => {
      const dashboard = { id: 'd-1', name: 'D1', tenantId: 't-1', widgets: [] };
      prisma.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findOne('d-1', 't-1');

      expect(result).toEqual(dashboard);
      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'd-1', tenantId: 't-1' },
        include: { widgets: true },
      });
    });

    it('should throw NotFoundException when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 't-1')).rejects.toThrow(NotFoundException);
      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId: 't-1' },
        include: { widgets: true },
      });
    });
  });

  describe('update', () => {
    it('should update an existing dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd-1', tenantId: 't-1', widgets: [] });
      prisma.dashboard.update.mockResolvedValue({ id: 'd-1', name: 'Updated', widgets: [] });

      const result = await service.update('d-1', { name: 'Updated' }, 't-1');

      expect(result.name).toBe('Updated');
      expect(prisma.dashboard.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-1' } }),
      );
    });

    it('should throw when updating non-existent dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.update('bad', { name: 'X' }, 't-1')).rejects.toThrow(NotFoundException);
      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad', tenantId: 't-1' } }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd-1', tenantId: 't-1', widgets: [] });
      prisma.dashboard.delete.mockResolvedValue({ id: 'd-1' });

      await service.remove('d-1', 't-1');

      expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'd-1' } });
      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-1', tenantId: 't-1' } }),
      );
    });

    it('should throw when removing non-existent dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.remove('bad', 't-1')).rejects.toThrow(NotFoundException);
      expect(prisma.dashboard.findFirst).toHaveBeenCalled();
    });
  });

  describe('setTenantContext', () => {
    it('should execute raw SQL to set tenant context', async () => {
      prisma.$executeRaw.mockResolvedValue(undefined);

      await service.setTenantContext('t-1');

      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
