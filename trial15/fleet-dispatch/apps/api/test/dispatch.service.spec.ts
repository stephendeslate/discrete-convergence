import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService, mockTenantId } from './helpers/test-utils';

describe('DispatchService', () => {
  let service: DispatchService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  describe('create', () => {
    it('should create a dispatch', async () => {
      const dto = { title: 'Test Dispatch' };
      const mockDispatch = { id: 'disp1', ...dto, tenantId: mockTenantId };
      prisma.dispatch.create.mockResolvedValue(mockDispatch);

      const result = await service.create(mockTenantId, dto);

      expect(result).toEqual(mockDispatch);
      expect(prisma.dispatch.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: dto.title,
            tenantId: mockTenantId,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated dispatches with relations', async () => {
      const mockDispatches = [
        { id: 'disp1', title: 'D1', vehicle: null, driver: null, route: null },
      ];
      prisma.dispatch.findMany.mockResolvedValue(mockDispatches);
      prisma.dispatch.count.mockResolvedValue(1);

      const result = await service.findAll(mockTenantId);

      expect(result.data).toEqual(mockDispatches);
      expect(result.total).toBe(1);
      expect(prisma.dispatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: mockTenantId },
          include: expect.objectContaining({
            vehicle: true,
            driver: true,
            route: true,
          }),
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      prisma.dispatch.findMany.mockResolvedValue([]);
      prisma.dispatch.count.mockResolvedValue(0);

      const result = await service.findAll(mockTenantId, 3, 10);

      expect(result.page).toBe(3);
      expect(prisma.dispatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dispatch with relations', async () => {
      const mockDispatch = {
        id: 'disp1',
        title: 'D1',
        tenantId: mockTenantId,
        vehicle: null,
        driver: null,
        route: null,
      };
      prisma.dispatch.findUnique.mockResolvedValue(mockDispatch);

      const result = await service.findOne(mockTenantId, 'disp1');

      expect(result).toEqual(mockDispatch);
      expect(prisma.dispatch.findUnique).toHaveBeenCalledWith({
        where: { id: 'disp1' },
        include: expect.objectContaining({
          vehicle: true,
          driver: true,
          route: true,
        }),
      });
    });

    it('should throw NotFoundException for missing dispatch', async () => {
      prisma.dispatch.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockTenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dispatch.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'nonexistent' },
        }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.dispatch.findUnique.mockResolvedValue({
        id: 'disp1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne(mockTenantId, 'disp1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.dispatch.findUnique).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a dispatch', async () => {
      const existing = { id: 'disp1', title: 'Old', tenantId: mockTenantId };
      const updated = { id: 'disp1', title: 'New', tenantId: mockTenantId };
      prisma.dispatch.findUnique.mockResolvedValue(existing);
      prisma.dispatch.update.mockResolvedValue(updated);

      const result = await service.update(mockTenantId, 'disp1', {
        title: 'New',
      });

      expect(result).toEqual(updated);
      expect(prisma.dispatch.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'disp1' },
        }),
      );
    });

    it('should throw NotFoundException when updating non-existent dispatch', async () => {
      prisma.dispatch.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockTenantId, 'nonexistent', { title: 'New' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.dispatch.findUnique).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a dispatch', async () => {
      const existing = { id: 'disp1', tenantId: mockTenantId };
      prisma.dispatch.findUnique.mockResolvedValue(existing);
      prisma.dispatch.delete.mockResolvedValue(existing);

      const result = await service.remove(mockTenantId, 'disp1');

      expect(result).toEqual(existing);
      expect(prisma.dispatch.delete).toHaveBeenCalledWith({
        where: { id: 'disp1' },
      });
    });
  });

  describe('getDispatchStats', () => {
    it('should execute raw query for stats', async () => {
      prisma.$executeRaw.mockResolvedValue(5);

      const result = await service.getDispatchStats(mockTenantId);

      expect(result).toEqual({ count: 5 });
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
