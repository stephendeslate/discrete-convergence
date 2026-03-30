import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { PrismaService } from '../src/common/prisma.service';

describe('DispatchService', () => {
  let service: DispatchService;
  const tenantId = 'tenant-1';

  const mockPrisma = {
    dispatch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dispatch with tenant context', async () => {
      const dto = {
        vehicleId: 'v-1',
        driverId: 'd-1',
        origin: '123 Start',
        destination: '456 End',
        scheduledAt: '2024-06-15T09:00:00Z',
        cost: 150,
      };
      const expected = { id: 'disp-1', ...dto, tenantId, status: 'PENDING' };
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
    it('should return dispatches with includes', async () => {
      const dispatches = [{ id: 'disp-1', tenantId, vehicle: {}, driver: {} }];
      mockPrisma.dispatch.findMany.mockResolvedValue(dispatches);

      const result = await service.findAll(tenantId, 1, 10);

      expect(result).toEqual(dispatches);
      expect(mockPrisma.dispatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          include: { vehicle: true, driver: true },
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dispatch with relations', async () => {
      const dispatch = { id: 'disp-1', tenantId, vehicle: {}, driver: {} };
      mockPrisma.dispatch.findFirst.mockResolvedValue(dispatch);

      const result = await service.findOne(tenantId, 'disp-1');

      expect(result).toEqual(dispatch);
      expect(mockPrisma.dispatch.findFirst).toHaveBeenCalledWith({
        where: { id: 'disp-1', tenantId },
        include: { vehicle: true, driver: true },
      });
    });

    it('should throw NotFoundException for non-existent dispatch', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dispatch.findFirst).toHaveBeenCalledWith({
        where: { id: 'bad', tenantId },
        include: { vehicle: true, driver: true },
      });
    });
  });

  describe('update', () => {
    it('should update a dispatch', async () => {
      const dispatch = { id: 'disp-1', tenantId, vehicle: {}, driver: {} };
      mockPrisma.dispatch.findFirst.mockResolvedValue(dispatch);
      mockPrisma.dispatch.update.mockResolvedValue({ ...dispatch, status: 'COMPLETED' });

      const result = await service.update(tenantId, 'disp-1', { status: 'COMPLETED' as const });

      expect(result.status).toBe('COMPLETED');
      expect(mockPrisma.dispatch.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'disp-1' },
        }),
      );
    });

    it('should throw NotFoundException for non-existent dispatch on update', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue(null);

      await expect(service.update(tenantId, 'bad', { notes: 'X' })).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dispatch.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a dispatch', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue({ id: 'disp-1', tenantId, vehicle: {}, driver: {} });
      mockPrisma.dispatch.delete.mockResolvedValue({ id: 'disp-1' });

      const result = await service.remove(tenantId, 'disp-1');

      expect(result.id).toBe('disp-1');
      expect(mockPrisma.dispatch.delete).toHaveBeenCalledWith({ where: { id: 'disp-1' } });
    });

    it('should throw NotFoundException when deleting non-existent dispatch', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dispatch.delete).not.toHaveBeenCalled();
    });
  });
});
