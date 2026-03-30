import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from '../src/vehicle/vehicle.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaModel } from './helpers/mock-prisma';

describe('VehicleService', () => {
  let service: VehicleService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      vehicle: createMockPrismaModel(),
      $executeRaw: jest.fn() as unknown as Record<string, jest.Mock>,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  it('should create a vehicle', async () => {
    prisma['vehicle'].create.mockResolvedValue({ id: '1', licensePlate: 'FL-001', make: 'Ford' });
    const result = await service.create('t1', {
      licensePlate: 'FL-001',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      fuelCapacity: 80,
    });
    expect(result).toHaveProperty('id');
    expect(prisma['vehicle'].create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          licensePlate: 'FL-001',
          make: 'Ford',
          tenantId: 't1',
        }),
      }),
    );
  });

  it('should throw NotFoundException when vehicle not found', async () => {
    prisma['vehicle'].findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
    expect(prisma['vehicle'].findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bad-id', tenantId: 't1' },
      }),
    );
  });

  it('should return paginated results', async () => {
    prisma['vehicle'].findMany.mockResolvedValue([{ id: '1' }]);
    prisma['vehicle'].count.mockResolvedValue(1);
    const result = await service.findAll('t1', 1, 10);
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
  });

  it('should update a vehicle after finding it', async () => {
    prisma['vehicle'].findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
    prisma['vehicle'].update.mockResolvedValue({ id: '1', mileage: 20000 });
    const result = await service.update('t1', '1', { mileage: 20000 });
    expect(result.mileage).toBe(20000);
    expect(prisma['vehicle'].update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
  });

  it('should soft-delete by setting status to RETIRED', async () => {
    prisma['vehicle'].findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
    prisma['vehicle'].update.mockResolvedValue({ id: '1', status: 'RETIRED' });
    const result = await service.remove('t1', '1');
    expect(result.status).toBe('RETIRED');
    expect(prisma['vehicle'].update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'RETIRED' },
      }),
    );
  });
});
