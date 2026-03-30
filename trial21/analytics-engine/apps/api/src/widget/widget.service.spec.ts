import { Test, TestingModule } from '@nestjs/testing';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WidgetType } from '@prisma/client';

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: {
    dashboard: { findFirst: jest.Mock };
    widget: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: { findFirst: jest.fn() },
      widget: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn(), delete: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  describe('create', () => {
    it('should create widget when under limit', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 't1', widgets: [] });
      prisma.widget.create.mockResolvedValue({ id: 'w1', title: 'Test Widget' });

      const result = await service.create('t1', 'd1', { title: 'Test Widget', type: WidgetType.BAR_CHART });
      expect(result.id).toBe('w1');
      expect(prisma.widget.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ title: 'Test Widget', dashboardId: 'd1' }),
      }));
    });

    it('should reject when widget limit reached', async () => {
      const widgets = Array.from({ length: 20 }, (_, i) => ({ id: `w${i}` }));
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', tenantId: 't1', widgets });

      await expect(service.create('t1', 'd1', { title: 'Over limit', type: WidgetType.LINE_CHART }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.create('t1', 'bad', { title: 'Test', type: WidgetType.TABLE }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return widgets for dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1' });
      prisma.widget.findMany.mockResolvedValue([{ id: 'w1' }]);
      const result = await service.findAll('t1', 'd1');
      expect(result).toHaveLength(1);
    });

    it('should throw when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.findAll('t1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should throw when widget not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1' });
      prisma.widget.findFirst.mockResolvedValue(null);
      await expect(service.findOne('t1', 'd1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete widget', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1' });
      prisma.widget.findFirst.mockResolvedValue({ id: 'w1' });
      prisma.widget.delete.mockResolvedValue({ id: 'w1' });
      await service.remove('t1', 'd1', 'w1');
      expect(prisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
    });
  });
});
