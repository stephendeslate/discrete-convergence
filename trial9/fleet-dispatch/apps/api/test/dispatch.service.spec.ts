import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('DispatchService', () => {
  let service: DispatchService;
  const mockPrisma = createMockPrismaService();
  const tenantId = 'test-tenant-001';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dispatch', async () => {
      const dto = {
        scheduledAt: '2024-01-15T08:00:00Z',
        vehicleId: 'v-1',
        driverId: 'd-1',
        routeId: 'r-1',
      };
      const expected = { id: 'dsp-1', ...dto, tenantId, status: 'PENDING' };
      mockPrisma.dispatch.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.dispatch.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId, vehicleId: 'v-1' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated dispatches', async () => {
      const mockDispatches = [{ id: 'dsp-1', tenantId }];
      mockPrisma.dispatch.findMany.mockResolvedValue(mockDispatches);
      mockPrisma.dispatch.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, '1', '10');
      expect(result.items).toEqual(mockDispatches);
      expect(result.total).toBe(1);
      expect(mockPrisma.dispatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dispatch by id', async () => {
      const mockDispatch = { id: 'dsp-1', tenantId, status: 'PENDING' };
      mockPrisma.dispatch.findUnique.mockResolvedValue(mockDispatch);

      const result = await service.findOne(tenantId, 'dsp-1');
      expect(result).toEqual(mockDispatch);
      expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith({
        where: { id: 'dsp-1' },
        include: { vehicle: true, driver: true, route: true },
      });
    });

    it('should throw NotFoundException for nonexistent dispatch', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'bad-id')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith({
        where: { id: 'bad-id' },
        include: { vehicle: true, driver: true, route: true },
      });
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue({
        id: 'dsp-1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne(tenantId, 'dsp-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a dispatch status', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue({ id: 'dsp-1', tenantId });
      const updated = { id: 'dsp-1', tenantId, status: 'IN_PROGRESS' };
      mockPrisma.dispatch.update.mockResolvedValue(updated);

      const result = await service.update(tenantId, 'dsp-1', { status: 'IN_PROGRESS' });
      expect(result).toEqual(updated);
      expect(mockPrisma.dispatch.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'dsp-1' } }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a dispatch', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue({ id: 'dsp-1', tenantId });
      mockPrisma.dispatch.delete.mockResolvedValue({ id: 'dsp-1' });

      const result = await service.remove(tenantId, 'dsp-1');
      expect(result).toEqual({ id: 'dsp-1' });
      expect(mockPrisma.dispatch.delete).toHaveBeenCalledWith({ where: { id: 'dsp-1' } });
    });

    it('should throw NotFoundException for nonexistent dispatch', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue(null);
      await expect(service.remove(tenantId, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
