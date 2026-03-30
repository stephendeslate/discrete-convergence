import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  dashboard: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
};

describe('DashboardService', () => {
  let service: DashboardService;

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

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DashboardService);
  });

  describe('findAll', () => {
    it('should return paginated dashboards scoped by tenantId', async () => {
      const dashboards = [{ id: '1', name: 'Test', tenantId: 't1' }];
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);
      mockPrisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('t1', 1, 10);

      expect(result.data).toEqual(dashboards);
      expect(result.total).toBe(1);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.dashboard.count).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id and tenantId', async () => {
      const dashboard = { id: '1', name: 'Test', tenantId: 't1' };
      mockPrisma.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findOne('1', 't1');

      expect(result).toEqual(dashboard);
      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: '1', tenantId: 't1' },
      });
    });

    it('should throw NotFoundException when dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 't1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: '999', tenantId: 't1' },
      });
    });
  });

  describe('create', () => {
    it('should create a dashboard with tenantId', async () => {
      const dto = { name: 'New Dashboard', description: 'Desc' };
      const created = { id: '1', ...dto, tenantId: 't1', status: 'draft' };
      mockPrisma.dashboard.create.mockResolvedValue(created);

      const result = await service.create('t1', dto);

      expect(result).toEqual(created);
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: {
          name: 'New Dashboard',
          description: 'Desc',
          tenantId: 't1',
          status: 'draft',
        },
      });
    });
  });

  describe('update', () => {
    it('should update a dashboard after verifying tenant ownership', async () => {
      const existing = { id: '1', name: 'Old', tenantId: 't1' };
      const updated = { id: '1', name: 'Updated', tenantId: 't1' };
      mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
      mockPrisma.dashboard.update.mockResolvedValue(updated);

      const result = await service.update('1', 't1', { name: 'Updated' });

      expect(result).toEqual(updated);
      expect(mockPrisma.dashboard.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a dashboard after verifying tenant ownership', async () => {
      const existing = { id: '1', name: 'Test', tenantId: 't1' };
      mockPrisma.dashboard.findFirst.mockResolvedValue(existing);
      mockPrisma.dashboard.delete.mockResolvedValue(existing);

      const result = await service.remove('1', 't1');

      expect(result).toEqual(existing);
      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
