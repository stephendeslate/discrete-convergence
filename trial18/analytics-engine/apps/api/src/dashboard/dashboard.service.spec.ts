import { Test } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(DashboardService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dashboard with tenant scoping', async () => {
      const created = { id: 'd1', title: 'Test', tenantId: 't1', widgets: [] };
      mockPrisma.dashboard.create.mockResolvedValue(created);

      const result = await service.create({ title: 'Test' }, 't1');

      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Test', tenantId: 't1' }),
        }),
      );
      expect(result.id).toBe('d1');
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards for tenant', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([{ id: 'd1' }]);
      mockPrisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, pageSize: 10 });

      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 't1' } }),
      );
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return dashboard when found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 't1' });

      const result = await service.findOne('d1', 't1');

      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd1', tenantId: 't1' } }),
      );
      expect(result.id).toBe('d1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('d999', 't1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd999', tenantId: 't1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update dashboard after verifying existence', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 't1' });
      mockPrisma.dashboard.update.mockResolvedValue({ id: 'd1', title: 'Updated' });

      const result = await service.update('d1', { title: 'Updated' }, 't1');

      expect(mockPrisma.dashboard.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd1' } }),
      );
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete dashboard after verifying existence', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 't1' });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: 'd1' });

      await service.remove('d1', 't1');

      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.remove('d999', 't1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dashboard.findFirst).toHaveBeenCalled();
    });
  });
});
