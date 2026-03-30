import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { PrismaService } from '../infra/prisma.service';
import { MaintenanceTypeEnum } from './dto/create-maintenance.dto';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      maintenance: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
      vehicle: { findFirst: jest.fn(), update: jest.fn() },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
  });

  describe('findAll', () => {
    it('should return paginated maintenance records', async () => {
      const mockData = [{ id: '1', type: 'SCHEDULED', tenantId: 't1' }];
      prisma.maintenance.findMany.mockResolvedValue(mockData);
      prisma.maintenance.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, pageSize: 10 });

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
      expect(prisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 't1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return maintenance when found', async () => {
      const mockMaintenance = { id: '1', type: 'SCHEDULED', tenantId: 't1', vehicleId: 'v1' };
      prisma.maintenance.findFirst.mockResolvedValue(mockMaintenance);

      const result = await service.findOne('1', 't1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result).toEqual(mockMaintenance);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.maintenance.findFirst.mockResolvedValue(null);
      await expect(service.findOne('x', 't1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create scheduled maintenance', async () => {
      const dto = {
        vehicleId: 'v1',
        type: MaintenanceTypeEnum.SCHEDULED,
        description: 'Oil change',
        scheduledDate: '2026-04-01T10:00:00Z',
        cost: 150,
      };
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      prisma.maintenance.create.mockResolvedValue({ id: 'm1', ...dto, tenantId: 't1' });

      const result = await service.create(dto, 't1', 'u1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.vehicle.findFirst).toHaveBeenCalledWith({ where: { id: 'v1', tenantId: 't1' } });
      expect(prisma.maintenance.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.id).toBe('m1');
      // Scheduled maintenance should NOT set vehicle to MAINTENANCE
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it('should set vehicle to MAINTENANCE for emergency type', async () => {
      const dto = {
        vehicleId: 'v1',
        type: MaintenanceTypeEnum.EMERGENCY,
        description: 'Brake failure',
        scheduledDate: '2026-04-01T10:00:00Z',
      };
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      prisma.maintenance.create.mockResolvedValue({ id: 'm2', ...dto, tenantId: 't1' });

      await service.create(dto, 't1', 'u1');

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { status: 'MAINTENANCE' },
      });
    });

    it('should throw NotFoundException when vehicle not found', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          { vehicleId: 'bad', type: MaintenanceTypeEnum.SCHEDULED, description: 'test', scheduledDate: '2026-04-01' },
          't1',
          'u1',
        ),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.maintenance.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update maintenance', async () => {
      prisma.maintenance.findFirst.mockResolvedValue({
        id: '1',
        status: 'SCHEDULED',
        tenantId: 't1',
        vehicleId: 'v1',
      });
      prisma.maintenance.update.mockResolvedValue({
        id: '1',
        description: 'Updated',
        tenantId: 't1',
      });

      const result = await service.update('1', { description: 'Updated' }, 't1', 'u1');

      expect(prisma.maintenance.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.description).toBe('Updated');
    });

    it('should convert scheduledDate string to Date', async () => {
      prisma.maintenance.findFirst.mockResolvedValue({
        id: '1',
        status: 'SCHEDULED',
        tenantId: 't1',
        vehicleId: 'v1',
      });
      prisma.maintenance.update.mockResolvedValue({ id: '1', tenantId: 't1' });

      await service.update('1', { scheduledDate: '2026-05-01T00:00:00Z' }, 't1', 'u1');

      expect(prisma.maintenance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scheduledDate: expect.any(Date),
          }),
        }),
      );
    });

    it('should reject update of completed maintenance', async () => {
      prisma.maintenance.findFirst.mockResolvedValue({
        id: '1',
        status: 'COMPLETED',
        tenantId: 't1',
        vehicleId: 'v1',
      });

      await expect(service.update('1', { description: 'X' }, 't1', 'u1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.maintenance.update).not.toHaveBeenCalled();
    });

    it('should reject update of cancelled maintenance', async () => {
      prisma.maintenance.findFirst.mockResolvedValue({
        id: '1',
        status: 'CANCELLED',
        tenantId: 't1',
        vehicleId: 'v1',
      });

      await expect(service.update('1', { description: 'X' }, 't1', 'u1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('complete', () => {
    it('should complete maintenance and restore vehicle status', async () => {
      prisma.maintenance.findFirst.mockResolvedValue({
        id: '1',
        status: 'IN_PROGRESS',
        tenantId: 't1',
        vehicleId: 'v1',
      });
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'MAINTENANCE' });
      prisma.maintenance.update.mockResolvedValue({
        id: '1',
        status: 'COMPLETED',
        tenantId: 't1',
      });

      const result = await service.complete('1', 't1', 'u1');

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { status: 'ACTIVE' },
      });
      expect(prisma.maintenance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe('COMPLETED');
    });

    it('should not restore vehicle if not in MAINTENANCE status', async () => {
      prisma.maintenance.findFirst.mockResolvedValue({
        id: '1',
        status: 'SCHEDULED',
        tenantId: 't1',
        vehicleId: 'v1',
      });
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      prisma.maintenance.update.mockResolvedValue({ id: '1', status: 'COMPLETED' });

      await service.complete('1', 't1', 'u1');

      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it('should throw if already completed', async () => {
      prisma.maintenance.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', tenantId: 't1', vehicleId: 'v1' });
      await expect(service.complete('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if cancelled', async () => {
      prisma.maintenance.findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', tenantId: 't1', vehicleId: 'v1' });
      await expect(service.complete('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });
  });
});
