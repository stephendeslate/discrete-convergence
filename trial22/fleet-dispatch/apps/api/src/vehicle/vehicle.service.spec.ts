import { Test } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('VehicleService', () => {
  let service: VehicleService;
  let prisma: { vehicle: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      vehicle: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module = await Test.createTestingModule({
      providers: [VehicleService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(VehicleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns paginated data', async () => {
    prisma.vehicle.findMany.mockResolvedValue([{ id: '1' }]);
    prisma.vehicle.count.mockResolvedValue(1);
    const result = await service.findAll('t1');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(prisma.vehicle.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 't1' } }));
  });

  it('findOne throws NotFoundException when not found', async () => {
    prisma.vehicle.findFirst.mockResolvedValue(null);
    await expect(service.findOne('v1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('findOne returns vehicle when found', async () => {
    prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', tenantId: 't1' });
    const result = await service.findOne('v1', 't1');
    expect(result).toEqual({ id: 'v1', tenantId: 't1' });
  });

  it('create delegates to prisma', async () => {
    prisma.vehicle.create.mockResolvedValue({ id: 'v1' });
    const dto = { vin: '12345678901234567', licensePlate: 'ABC123', make: 'Ford', model: 'Transit', year: 2024, mileage: 0 };
    await service.create(dto, 't1');
    expect(prisma.vehicle.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ vin: '12345678901234567', tenantId: 't1' }),
    }));
  });
});
