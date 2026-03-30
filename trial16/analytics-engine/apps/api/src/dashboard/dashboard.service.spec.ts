import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

jest.mock('@analytics-engine/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  ALLOWED_REGISTRATION_ROLES: ['user', 'admin'],
}));

const mockPrisma = {
  dashboard: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dashboard with tenantId', async () => {
      const dto: CreateDashboardDto = { title: 'Test Dashboard', description: 'Desc', status: 'DRAFT' };
      const expected = { id: 'dash-1', ...dto, tenantId };
      mockPrisma.dashboard.create.mockResolvedValue(expected);

      const result = await service.create(dto, tenantId);

      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          status: 'DRAFT',
          tenantId,
        },
        include: { widgets: true },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards', async () => {
      const dashboards = [{ id: 'dash-1', title: 'Test' }];
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);
      mockPrisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, {});

      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { widgets: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.dashboard.count).toHaveBeenCalledWith({ where: { tenantId } });
      expect(result).toEqual({ data: dashboards, total: 1, page: 1, pageSize: 10 });
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id and tenantId', async () => {
      const dashboard = { id: 'dash-1', title: 'Test', tenantId };
      mockPrisma.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findOne('dash-1', tenantId);

      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'dash-1', tenantId },
        include: { widgets: true },
      });
      expect(result).toEqual(dashboard);
    });

    it('should throw NotFoundException when dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', tenantId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'non-existent', tenantId },
        include: { widgets: true },
      });
    });
  });

  describe('update', () => {
    it('should update a dashboard after verifying it exists', async () => {
      const existing = { id: 'dash-1', title: 'Old', tenantId };
      const dto: UpdateDashboardDto = { title: 'Updated', description: 'New desc', status: 'PUBLISHED' };
      mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
      mockPrisma.dashboard.update.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update('dash-1', dto, tenantId);

      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'dash-1', tenantId },
        include: { widgets: true },
      });
      expect(mockPrisma.dashboard.update).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
        data: { title: dto.title, description: dto.description, status: 'PUBLISHED' },
        include: { widgets: true },
      });
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard after verifying it exists', async () => {
      const existing = { id: 'dash-1', tenantId };
      mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
      mockPrisma.dashboard.delete.mockResolvedValue(existing);

      await service.remove('dash-1', tenantId);

      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'dash-1', tenantId },
        include: { widgets: true },
      });
      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
    });
  });
});
