import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from '../src/vehicle/vehicle.service';
import { PrismaService } from '../src/infra/prisma.service';
import { LoggerService } from '../src/infra/logger.service';

describe('VehicleService', () => {
  let service: VehicleService;
  let prisma: {
    vehicle: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    $executeRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      vehicle: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: prisma },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  // TRACED: FD-VEH-007
  it('should return paginated vehicles', async () => {
    prisma.vehicle.findMany.mockResolvedValue([{ id: 'v1', vin: 'VIN1' }]);
    prisma.vehicle.count.mockResolvedValue(1);

    const result = await service.findAll('t1', { page: 1, pageSize: 10 });
    expect(result.data).toHaveLength(1);
    expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1' }, skip: 0, take: 10 }),
    );
  });

  // TRACED: FD-VEH-008
  it('should find a vehicle by id and tenantId', async () => {
    prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', tenantId: 't1' });

    const result = await service.findOne('v1', 't1');
    expect(result.id).toBe('v1');
    expect(prisma.vehicle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'v1', tenantId: 't1' } }),
    );
  });

  // TRACED: FD-VEH-009
  it('should throw NotFoundException when vehicle not found', async () => {
    prisma.vehicle.findFirst.mockResolvedValue(null);

    await expect(service.findOne('v-none', 't1')).rejects.toThrow(NotFoundException);
    expect(prisma.vehicle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'v-none', tenantId: 't1' } }),
    );
  });

  // TRACED: FD-VEH-010
  it('should create a vehicle', async () => {
    prisma.vehicle.create.mockResolvedValue({
      id: 'v2',
      vin: 'VIN2',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      mileage: 0,
      tenantId: 't1',
    });

    const result = await service.create({ vin: 'VIN2', make: 'Ford', model: 'Transit', year: 2023 }, 't1');
    expect(result.vin).toBe('VIN2');
    expect(prisma.vehicle.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ vin: 'VIN2', tenantId: 't1' }) }),
    );
  });

  // TRACED: FD-VEH-011
  it('should throw NotFoundException when updating non-existent vehicle', async () => {
    prisma.vehicle.findFirst.mockResolvedValue(null);

    await expect(service.update('v-none', { make: 'Toyota' }, 't1')).rejects.toThrow(NotFoundException);
    expect(prisma.vehicle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'v-none', tenantId: 't1' } }),
    );
  });

  // TRACED: FD-VEH-012
  it('should delete a vehicle', async () => {
    prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', tenantId: 't1' });
    prisma.vehicle.delete.mockResolvedValue({ id: 'v1' });

    const result = await service.delete('v1', 't1');
    expect(result.deleted).toBe(true);
    expect(prisma.vehicle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'v1', tenantId: 't1' } }),
    );
  });

  // TRACED: FD-VEH-013
  it('should throw NotFoundException when deleting non-existent vehicle', async () => {
    prisma.vehicle.findFirst.mockResolvedValue(null);

    await expect(service.delete('v-none', 't1')).rejects.toThrow(NotFoundException);
    expect(prisma.vehicle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'v-none', tenantId: 't1' } }),
    );
  });

  // TRACED: FD-VEH-014
  it('should run maintenance cost report', async () => {
    prisma.$executeRaw.mockResolvedValue(3);

    const result = await service.getMaintenanceCostReport('t1');
    expect(result.affectedRows).toBe(3);
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
