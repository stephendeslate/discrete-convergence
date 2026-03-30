import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/infra/prisma.service';

// TRACED:AE-TEST-007 — Dashboard service unit test with mocked Prisma
describe('DashboardService', () => {
  let service: DashboardService;

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
    it('should create a dashboard', async () => {
      const expected = {
        id: 'dash-1',
        title: 'Test',
        description: null,
        status: 'DRAFT',
        tenantId: 'tenant-1',
        widgets: [],
      };
      mockPrisma.dashboard.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', { title: 'Test' });
      expect(result).toEqual(expected);
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: { title: 'Test', description: undefined, tenantId: 'tenant-1' },
        include: { widgets: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards', async () => {
      const items = [{ id: 'dash-1', title: 'Test', widgets: [] }];
      mockPrisma.dashboard.findMany.mockResolvedValue(items);
      mockPrisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard', async () => {
      const expected = { id: 'dash-1', title: 'Test', tenantId: 'tenant-1', widgets: [] };
      mockPrisma.dashboard.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('dash-1', 'tenant-1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      const existing = { id: 'dash-1', title: 'Old', tenantId: 'tenant-1' };
      const updated = { ...existing, title: 'New', widgets: [] };
      mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
      mockPrisma.dashboard.update.mockResolvedValue(updated);

      const result = await service.update('dash-1', 'tenant-1', { title: 'New' });
      expect(result.title).toBe('New');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      const existing = { id: 'dash-1', tenantId: 'tenant-1' };
      mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
      mockPrisma.dashboard.delete.mockResolvedValue(existing);

      await service.remove('dash-1', 'tenant-1');
      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
      });
    });
  });

  describe('publish', () => {
    it('should publish a dashboard', async () => {
      const existing = { id: 'dash-1', status: 'DRAFT', tenantId: 'tenant-1' };
      const published = { ...existing, status: 'PUBLISHED' };
      mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
      mockPrisma.dashboard.update.mockResolvedValue(published);

      const result = await service.publish('dash-1', 'tenant-1');
      expect(result.status).toBe('PUBLISHED');
    });
  });

  describe('archive', () => {
    it('should archive a dashboard', async () => {
      const existing = { id: 'dash-1', status: 'PUBLISHED', tenantId: 'tenant-1' };
      const archived = { ...existing, status: 'ARCHIVED' };
      mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
      mockPrisma.dashboard.update.mockResolvedValue(archived);

      const result = await service.archive('dash-1', 'tenant-1');
      expect(result.status).toBe('ARCHIVED');
    });
  });
});
