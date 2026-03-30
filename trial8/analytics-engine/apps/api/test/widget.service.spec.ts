import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from '../src/widget/widget.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaModel } from './helpers/mock-prisma';

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = { widget: createMockPrismaModel() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WidgetService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  describe('create', () => {
    it('should create a widget with default config', async () => {
      prisma.widget.create.mockResolvedValue({ id: 'w1', title: 'Chart 1', type: 'CHART', config: {} });

      const result = await service.create('d1', { title: 'Chart 1', type: 'CHART' });

      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Chart 1', type: 'CHART', dashboardId: 'd1', config: {} }),
        }),
      );
      expect(result).toHaveProperty('id', 'w1');
      expect(result.type).toBe('CHART');
    });

    it('should pass custom config when provided', async () => {
      const config = { chartType: 'bar', dataField: 'revenue' };
      prisma.widget.create.mockResolvedValue({ id: 'w2', config });

      const result = await service.create('d1', { title: 'Revenue', type: 'CHART', config });

      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ config }),
        }),
      );
      expect(result.config).toEqual(config);
    });
  });

  describe('findOne', () => {
    it('should return widget when found', async () => {
      prisma.widget.findFirst.mockResolvedValue({ id: 'w1', title: 'My Widget' });

      const result = await service.findOne('w1');

      expect(prisma.widget.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'w1' } }),
      );
      expect(result).toHaveProperty('title', 'My Widget');
    });

    it('should throw NotFoundException when widget not found', async () => {
      prisma.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
      expect(prisma.widget.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad-id' } }),
      );
    });
  });

  describe('update', () => {
    it('should update widget after verifying it exists', async () => {
      prisma.widget.findFirst.mockResolvedValue({ id: 'w1' });
      prisma.widget.update.mockResolvedValue({ id: 'w1', title: 'Updated' });

      const result = await service.update('w1', { title: 'Updated' });

      expect(prisma.widget.findFirst).toHaveBeenCalled();
      expect(prisma.widget.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'w1' } }),
      );
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete widget after verifying it exists', async () => {
      prisma.widget.findFirst.mockResolvedValue({ id: 'w1' });
      prisma.widget.delete.mockResolvedValue({ id: 'w1' });

      const result = await service.remove('w1');

      expect(prisma.widget.findFirst).toHaveBeenCalled();
      expect(prisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
      expect(result).toHaveProperty('id', 'w1');
    });
  });
});
