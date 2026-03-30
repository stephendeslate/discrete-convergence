import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  widget: {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(WidgetService);
  });

  describe('findAll', () => {
    it('should return paginated widgets scoped by tenantId', async () => {
      const widgets = [{ id: '1', name: 'Chart', tenantId: 't1' }];
      mockPrisma.widget.findMany.mockResolvedValue(widgets);
      mockPrisma.widget.count.mockResolvedValue(1);

      const result = await service.findAll('t1', 1, 10);

      expect(result.data).toEqual(widgets);
      expect(result.total).toBe(1);
      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.widget.count).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a widget by id and tenantId', async () => {
      const widget = { id: '1', name: 'Chart', tenantId: 't1' };
      mockPrisma.widget.findFirst.mockResolvedValue(widget);

      const result = await service.findOne('1', 't1');

      expect(result).toEqual(widget);
      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith({
        where: { id: '1', tenantId: 't1' },
      });
    });

    it('should throw NotFoundException when widget not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 't1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith({
        where: { id: '999', tenantId: 't1' },
      });
    });
  });

  describe('create', () => {
    it('should create a widget with tenantId', async () => {
      const dto = { name: 'Chart', type: 'bar', dashboardId: 'd1' };
      const created = { id: '1', ...dto, tenantId: 't1', config: null };
      mockPrisma.widget.create.mockResolvedValue(created);

      const result = await service.create('t1', dto);

      expect(result).toEqual(created);
      expect(mockPrisma.widget.create).toHaveBeenCalledWith({
        data: {
          name: 'Chart',
          type: 'bar',
          dashboardId: 'd1',
          config: null,
          tenantId: 't1',
        },
      });
    });
  });

  describe('update', () => {
    it('should update a widget after verifying tenant ownership', async () => {
      const existing = { id: '1', name: 'Old', tenantId: 't1' };
      const updated = { id: '1', name: 'New Chart', tenantId: 't1' };
      mockPrisma.widget.findFirst.mockResolvedValue(existing);
      mockPrisma.widget.update.mockResolvedValue(updated);

      const result = await service.update('1', 't1', { name: 'New Chart' });

      expect(result).toEqual(updated);
      expect(mockPrisma.widget.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'New Chart' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a widget after verifying tenant ownership', async () => {
      const existing = { id: '1', name: 'Chart', tenantId: 't1' };
      mockPrisma.widget.findFirst.mockResolvedValue(existing);
      mockPrisma.widget.delete.mockResolvedValue(existing);

      const result = await service.remove('1', 't1');

      expect(result).toEqual(existing);
      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
