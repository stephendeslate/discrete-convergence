import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from '../src/vehicle/vehicle.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('VehicleService', () => {
  let service: VehicleService;
  let prisma: {
    vehicle: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    $executeRaw: jest.Mock;
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    prisma = {
      vehicle: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  describe('create', () => {
    it('should create a vehicle', async () => {
      const dto = { licensePlate: 'FD-001', make: 'Ford', model: 'Transit', year: 2023, capacity: 2500 };
      const expected = { id: '1', ...dto, tenantId };
      prisma.vehicle.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(expected);
      expect(prisma.vehicle.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ tenantId }) }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicles for tenant', async () => {
      const vehicles = [{ id: '1', tenantId }, { id: '2', tenantId }];
      prisma.vehicle.findMany.mockResolvedValue(vehicles);

      const result = await service.findAll(tenantId, 1, 10);

      expect(result).toEqual(vehicles);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should use default pagination when no params provided', async () => {
      prisma.vehicle.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id', async () => {
      const vehicle = { id: '1', tenantId };
      prisma.vehicle.findUnique.mockResolvedValue(vehicle);

      const result = await service.findOne(tenantId, '1');

      expect(result).toEqual(vehicle);
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(NotFoundException);
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'nonexistent' } }),
      );
    });

    it('should throw NotFoundException if vehicle belongs to different tenant', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({ id: '1', tenantId: 'other-tenant' });

      await expect(service.findOne(tenantId, '1')).rejects.toThrow(NotFoundException);
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const vehicle = { id: '1', tenantId, make: 'Ford' };
      prisma.vehicle.findUnique.mockResolvedValue(vehicle);
      prisma.vehicle.update.mockResolvedValue({ ...vehicle, make: 'Toyota' });

      const result = await service.update(tenantId, '1', { make: 'Toyota' });

      expect(result.make).toBe('Toyota');
      expect(prisma.vehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException when updating non-existent vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.update(tenantId, 'bad', { make: 'X' })).rejects.toThrow(NotFoundException);
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad' } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({ id: '1', tenantId });
      prisma.vehicle.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove(tenantId, '1');

      expect(result).toEqual({ id: '1' });
      expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when deleting non-existent vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(prisma.vehicle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad' } }),
      );
    });
  });

  describe('getVehicleStats', () => {
    it('should return vehicle stats', async () => {
      prisma.$executeRaw.mockResolvedValue(5);

      const result = await service.getVehicleStats(tenantId);

      expect(result).toEqual({ count: 5 });
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
