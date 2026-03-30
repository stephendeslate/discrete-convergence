import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from '../src/widget/widget.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService, mockTenantId } from './helpers/test-utils';

describe('WidgetService', () => {
  let service: WidgetService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  describe('create', () => {
    it('should create a widget', async () => {
      const mockWidget = {
        id: 'w-1',
        title: 'Chart',
        type: 'BAR_CHART',
        config: {},
        dashboardId: 'dash-1',
        tenantId: mockTenantId,
        dashboard: {},
        dataSource: null,
      };
      prisma.widget.create.mockResolvedValue(mockWidget);

      const result = await service.create(
        { title: 'Chart', type: 'BAR_CHART', dashboardId: 'dash-1' },
        mockTenantId,
      );

      expect(result).toEqual(mockWidget);
      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Chart',
            tenantId: mockTenantId,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated widgets for tenant', async () => {
      const widgets = [{ id: 'w-1', tenantId: mockTenantId }];
      prisma.widget.findMany.mockResolvedValue(widgets);
      prisma.widget.count.mockResolvedValue(1);

      const result = await service.findAll(mockTenantId);

      expect(result.data).toEqual(widgets);
      expect(result.total).toBe(1);
      expect(prisma.widget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: mockTenantId },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a widget by id', async () => {
      const mockWidget = { id: 'w-1', tenantId: mockTenantId, dashboard: {}, dataSource: null };
      prisma.widget.findUnique.mockResolvedValue(mockWidget);

      const result = await service.findOne('w-1', mockTenantId);

      expect(result).toEqual(mockWidget);
      expect(prisma.widget.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'w-1' } }),
      );
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.widget.findUnique).toHaveBeenCalled();
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.widget.findUnique.mockResolvedValue({
        id: 'w-1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne('w-1', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.widget.findUnique).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      prisma.widget.findUnique.mockResolvedValue({ id: 'w-1', tenantId: mockTenantId });
      prisma.widget.delete.mockResolvedValue({ id: 'w-1' });

      await service.remove('w-1', mockTenantId);

      expect(prisma.widget.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'w-1' } }),
      );
    });

    it('should throw NotFoundException when deleting non-existent widget', async () => {
      prisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.remove('bad-id', mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.widget.delete).not.toHaveBeenCalled();
    });
  });
});
