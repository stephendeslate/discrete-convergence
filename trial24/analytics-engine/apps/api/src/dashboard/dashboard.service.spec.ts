// TRACED:TEST-DASHBOARD-SERVICE — Unit tests for DashboardService
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.module';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const tenantId = '00000000-0000-0000-0000-000000000001';
const userId = '00000000-0000-0000-0000-000000000002';
const dashboardId = '00000000-0000-0000-0000-000000000003';

const mockDashboard = {
  id: dashboardId,
  name: 'Test Dashboard',
  description: 'A test',
  isPublic: false,
  userId,
  tenantId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  dashboard: {
    create: jest.fn().mockResolvedValue(mockDashboard),
    findMany: jest.fn().mockResolvedValue([mockDashboard]),
    findFirst: jest.fn().mockResolvedValue(mockDashboard),
    count: jest.fn().mockResolvedValue(1),
    update: jest.fn().mockResolvedValue({ ...mockDashboard, name: 'Updated' }),
    delete: jest.fn().mockResolvedValue(mockDashboard),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('create', () => {
    it('should create a dashboard with correct tenant', async () => {
      const result = await service.create({ name: 'New', description: 'Desc' }, userId, tenantId);
      expect(result).toHaveProperty('id');
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId, userId }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const result = await service.findAll(tenantId, 1, 10);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('totalPages');
    });

    it('should use default pagination when no params given', async () => {
      const result = await service.findAll(tenantId);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id and tenant', async () => {
      const result = await service.findOne(dashboardId, tenantId);
      expect(result.id).toBe(dashboardId);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValueOnce(null);
      await expect(service.findOne('nonexistent', tenantId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update dashboard name', async () => {
      const result = await service.update(dashboardId, { name: 'Updated' }, userId, tenantId);
      expect(result.name).toBe('Updated');
    });

    it('should throw ForbiddenException for wrong user', async () => {
      await expect(
        service.update(dashboardId, { name: 'Updated' }, 'other-user', tenantId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete the dashboard', async () => {
      await service.remove(dashboardId, userId, tenantId);
      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: dashboardId } });
    });

    it('should throw ForbiddenException for non-owner', async () => {
      await expect(service.remove(dashboardId, 'other-user', tenantId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
