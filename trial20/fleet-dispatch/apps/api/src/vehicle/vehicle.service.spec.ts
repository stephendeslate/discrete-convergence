import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  vehicle: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

describe('VehicleService', () => {
  let service: VehicleService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(VehicleService);
    jest.clearAllMocks();
  });

  it('should find all vehicles with tenant scoping', async () => {
    mockPrisma.vehicle.findMany.mockResolvedValue([{ id: '1', name: 'Truck' }]);
    mockPrisma.vehicle.count.mockResolvedValue(1);
    const result = await service.findAll('t1', 1, 10);
    expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1' } }),
    );
    expect(result.data).toHaveLength(1);
  });

  it('should find one vehicle by id', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    const result = await service.findOne('1', 't1');
    expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException if vehicle not found', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue(null);
    await expect(service.findOne('bad', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: 'bad' } });
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.vehicle.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should create a vehicle', async () => {
    const dto = { name: 'Van', licensePlate: 'ABC', make: 'Ford', model: 'Transit', year: 2023, mileage: 0, costPerMile: 0.50 };
    mockPrisma.vehicle.create.mockResolvedValue({ id: '2', ...dto, tenantId: 't1' });
    const result = await service.create(dto, 't1');
    expect(mockPrisma.vehicle.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 't1' }) }),
    );
    expect(result.name).toBe('Van');
  });

  it('should update a vehicle', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    mockPrisma.vehicle.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await service.update('1', { name: 'Updated' }, 't1');
    expect(mockPrisma.vehicle.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.name).toBe('Updated');
  });

  it('should delete a vehicle', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    mockPrisma.vehicle.delete.mockResolvedValue({ id: '1' });
    await service.remove('1', 't1');
    expect(mockPrisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should execute raw tenant query', async () => {
    mockPrisma.$executeRaw.mockResolvedValue(5);
    const result = await service.executeRawTenantQuery('t1');
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    expect(result).toBe(5);
  });
});
