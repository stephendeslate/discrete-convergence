import { Test } from '@nestjs/testing';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  widget: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(WidgetService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a widget with tenant scoping', async () => {
      const created = { id: 'w1', title: 'Revenue', tenantId: 't1' };
      mockPrisma.widget.create.mockResolvedValue(created);

      const result = await service.create(
        { title: 'Revenue', type: 'BAR_CHART', dashboardId: 'd1' },
        't1',
      );

      expect(mockPrisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Revenue', tenantId: 't1' }),
        }),
      );
      expect(result.id).toBe('w1');
    });
  });

  describe('findAll', () => {
    it('should return paginated widgets for tenant', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([{ id: 'w1' }]);
      mockPrisma.widget.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, pageSize: 10 });

      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 't1' } }),
      );
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return widget when found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({ id: 'w1', tenantId: 't1' });

      const result = await service.findOne('w1', 't1');

      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'w1', tenantId: 't1' } }),
      );
      expect(result.id).toBe('w1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne('w999', 't1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'w999', tenantId: 't1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update widget after verifying existence', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({ id: 'w1', tenantId: 't1' });
      mockPrisma.widget.update.mockResolvedValue({ id: 'w1', title: 'Updated' });

      const result = await service.update('w1', { title: 'Updated' }, 't1');

      expect(mockPrisma.widget.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'w1' } }),
      );
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete widget after verifying existence', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({ id: 'w1', tenantId: 't1' });
      mockPrisma.widget.delete.mockResolvedValue({ id: 'w1' });

      await service.remove('w1', 't1');

      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
      expect(mockPrisma.widget.findFirst).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent widget', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.remove('w999', 't1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.widget.findFirst).toHaveBeenCalled();
    });
  });
});
