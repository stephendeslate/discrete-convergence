import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from '../src/widget/widget.service';
import { PrismaService } from '../src/infra/prisma.service';

const mockPrisma = {
  widget: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a widget with correct data', async () => {
      const mockWidget = { id: 'w-1', title: 'Chart', type: 'BAR_CHART', tenantId: 'tenant-1' };
      mockPrisma.widget.create.mockResolvedValue(mockWidget);

      const result = await service.create(
        { title: 'Chart', type: 'BAR_CHART', dashboardId: 'dash-1' },
        'tenant-1',
      );

      expect(result).toEqual(mockWidget);
      expect(mockPrisma.widget.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Chart',
          type: 'BAR_CHART',
          dashboardId: 'dash-1',
          tenantId: 'tenant-1',
        }),
        include: { dashboard: true, dataSource: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated widgets for tenant', async () => {
      const mockWidgets = [{ id: 'w-1', title: 'Chart' }];
      mockPrisma.widget.findMany.mockResolvedValue(mockWidgets);
      mockPrisma.widget.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.data).toEqual(mockWidgets);
      expect(result.total).toBe(1);
      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a widget by id and tenant', async () => {
      const mockWidget = { id: 'w-1', tenantId: 'tenant-1', title: 'Chart' };
      mockPrisma.widget.findUnique.mockResolvedValue(mockWidget);

      const result = await service.findOne('w-1', 'tenant-1');

      expect(result).toEqual(mockWidget);
      expect(mockPrisma.widget.findUnique).toHaveBeenCalledWith({
        where: { id: 'w-1' },
        include: { dashboard: true, dataSource: true },
      });
    });

    it('should throw NotFoundException for non-existent widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.widget.findUnique).toHaveBeenCalledWith({
        where: { id: 'bad-id' },
        include: { dashboard: true, dataSource: true },
      });
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: 'w-1', tenantId: 'other-tenant' });

      await expect(service.findOne('w-1', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.widget.findUnique).toHaveBeenCalledWith({
        where: { id: 'w-1' },
        include: { dashboard: true, dataSource: true },
      });
    });
  });

  describe('update', () => {
    it('should update a widget with correct data', async () => {
      const existing = { id: 'w-1', tenantId: 'tenant-1' };
      mockPrisma.widget.findUnique.mockResolvedValue(existing);
      mockPrisma.widget.update.mockResolvedValue({ ...existing, title: 'Updated' });

      const result = await service.update('w-1', { title: 'Updated' }, 'tenant-1');

      expect(result.title).toBe('Updated');
      expect(mockPrisma.widget.update).toHaveBeenCalledWith({
        where: { id: 'w-1' },
        data: { title: 'Updated' },
        include: { dashboard: true, dataSource: true },
      });
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      const existing = { id: 'w-1', tenantId: 'tenant-1' };
      mockPrisma.widget.findUnique.mockResolvedValue(existing);
      mockPrisma.widget.delete.mockResolvedValue(existing);

      const result = await service.remove('w-1', 'tenant-1');

      expect(result).toEqual(existing);
      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({
        where: { id: 'w-1' },
      });
    });

    it('should throw when removing non-existent widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.widget.findUnique).toHaveBeenCalledWith({
        where: { id: 'bad-id' },
        include: { dashboard: true, dataSource: true },
      });
    });
  });
});
