import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '../infra/prisma.service';
import { VehicleTypeEnum } from './dto/create-vehicle.dto';

describe('VehicleService', () => {
  let service: VehicleService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vehicle: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      dispatch: { count: jest.fn().mockResolvedValue(0) },
      auditLog: { create: jest.fn() },
      $executeRaw: jest.fn(),
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated vehicles', async () => {
      const mockData = [{ id: 'v1', name: 'Truck 1', tenantId: 't1' }];
      prisma.vehicle.findMany.mockResolvedValue(mockData);
      prisma.vehicle.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, pageSize: 10 });

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return vehicle when found', async () => {
      const mockVehicle = { id: 'v1', name: 'Truck 1', tenantId: 't1' };
      prisma.vehicle.findFirst.mockResolvedValue(mockVehicle);

      const result = await service.findOne('v1', 't1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 't1')).rejects.toThrow(NotFoundException);
      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.vehicle.findFirst).toHaveBeenCalledWith({
        where: { id: 'bad-id', tenantId: 't1' },
      });
    });
  });

  describe('create', () => {
    it('should create a vehicle', async () => {
      const dto = { name: 'Truck 1', plateNumber: 'ABC-123', type: VehicleTypeEnum.TRUCK, capacity: 10 };
      prisma.vehicle.create.mockResolvedValue({ id: 'v1', ...dto, tenantId: 't1' });

      const result = await service.create(dto, 't1', 'u1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.vehicle.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.id).toBe('v1');
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', name: 'Truck 1', tenantId: 't1' });
      prisma.vehicle.update.mockResolvedValue({ id: 'v1', name: 'Truck 2', tenantId: 't1' });

      const result = await service.update('v1', { name: 'Truck 2' }, 't1', 'u1');

      expect(prisma.vehicle.update).toHaveBeenCalledWith({ where: { id: 'v1' }, data: { name: 'Truck 2' } });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.name).toBe('Truck 2');
    });

    it('should throw if vehicle not found', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);
      await expect(service.update('x', { name: 'Y' }, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a vehicle', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', name: 'Truck 1', tenantId: 't1' });

      const result = await service.remove('v1', 't1', 'u1');

      expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: 'v1' } });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.deleted).toBe(true);
    });

    it('should throw if vehicle not found', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);
      await expect(service.remove('x', 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('should throw if already active', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: '1', status: 'ACTIVE', tenantId: 't1' });
      await expect(service.activate('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it('should throw if in maintenance', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: '1', status: 'MAINTENANCE', tenantId: 't1' });
      await expect(service.activate('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it('should activate inactive vehicle', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: '1', status: 'INACTIVE', tenantId: 't1' });
      prisma.vehicle.update.mockResolvedValue({ id: '1', status: 'ACTIVE' });
      const result = await service.activate('1', 't1', 'u1');
      expect(result.status).toBe('ACTIVE');
      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'ACTIVE' },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('should throw if already inactive', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: '1', status: 'INACTIVE', tenantId: 't1' });
      await expect(service.deactivate('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it('should throw if active dispatches exist', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: '1', status: 'ACTIVE', tenantId: 't1' });
      prisma.dispatch.count.mockResolvedValue(2);
      await expect(service.deactivate('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it('should deactivate vehicle with no active dispatches', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: '1', status: 'ACTIVE', tenantId: 't1' });
      prisma.dispatch.count.mockResolvedValue(0);
      prisma.vehicle.update.mockResolvedValue({ id: '1', status: 'INACTIVE' });

      const result = await service.deactivate('1', 't1', 'u1');

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'INACTIVE' },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe('INACTIVE');
    });
  });
});
