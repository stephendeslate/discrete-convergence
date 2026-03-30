import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

jest.mock('@analytics-engine/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  ALLOWED_REGISTRATION_ROLES: ['user', 'admin'],
}));

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
  const tenantId = 'tenant-1';

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
    it('should create a widget with tenantId', async () => {
      const dto: CreateWidgetDto = {
        title: 'Test Widget',
        type: 'CHART',
        config: { color: 'blue' },
        dashboardId: 'dash-1',
        dataSourceId: 'ds-1',
      };
      const expected = { id: 'widget-1', ...dto, tenantId };
      mockPrisma.widget.create.mockResolvedValue(expected);

      const result = await service.create(dto, tenantId);

      expect(mockPrisma.widget.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          type: dto.type,
          config: dto.config,
          dashboardId: dto.dashboardId,
          dataSourceId: dto.dataSourceId,
          tenantId,
        },
        include: { dashboard: true, dataSource: true },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated widgets', async () => {
      const widgets = [{ id: 'widget-1', title: 'Test' }];
      mockPrisma.widget.findMany.mockResolvedValue(widgets);
      mockPrisma.widget.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, {});

      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { dashboard: true, dataSource: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.widget.count).toHaveBeenCalledWith({ where: { tenantId } });
      expect(result).toEqual({ data: widgets, total: 1, page: 1, pageSize: 10 });
    });
  });

  describe('findOne', () => {
    it('should return a widget by id and tenantId', async () => {
      const widget = { id: 'widget-1', title: 'Test', tenantId };
      mockPrisma.widget.findFirst.mockResolvedValue(widget);

      const result = await service.findOne('widget-1', tenantId);

      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith({
        where: { id: 'widget-1', tenantId },
        include: { dashboard: true, dataSource: true },
      });
      expect(result).toEqual(widget);
    });

    it('should throw NotFoundException when widget not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent', tenantId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith({
        where: { id: 'non-existent', tenantId },
        include: { dashboard: true, dataSource: true },
      });
    });
  });

  describe('update', () => {
    it('should update a widget after verifying it exists', async () => {
      const existing = { id: 'widget-1', title: 'Old', tenantId };
      const dto: UpdateWidgetDto = {
        title: 'Updated',
        type: 'TABLE',
        config: { rows: 10 },
        dashboardId: 'dash-2',
        dataSourceId: 'ds-2',
      };
      mockPrisma.widget.findFirst.mockResolvedValue(existing);
      mockPrisma.widget.update.mockResolvedValue({ ...existing, ...dto });

      const result = await service.update('widget-1', dto, tenantId);

      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith({
        where: { id: 'widget-1', tenantId },
        include: { dashboard: true, dataSource: true },
      });
      expect(mockPrisma.widget.update).toHaveBeenCalledWith({
        where: { id: 'widget-1' },
        data: {
          title: dto.title,
          type: dto.type,
          config: dto.config,
          dashboardId: dto.dashboardId,
          dataSourceId: dto.dataSourceId,
        },
        include: { dashboard: true, dataSource: true },
      });
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a widget after verifying it exists', async () => {
      const existing = { id: 'widget-1', tenantId };
      mockPrisma.widget.findFirst.mockResolvedValue(existing);
      mockPrisma.widget.delete.mockResolvedValue(existing);

      await service.remove('widget-1', tenantId);

      expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith({
        where: { id: 'widget-1', tenantId },
        include: { dashboard: true, dataSource: true },
      });
      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'widget-1' } });
    });
  });
});
