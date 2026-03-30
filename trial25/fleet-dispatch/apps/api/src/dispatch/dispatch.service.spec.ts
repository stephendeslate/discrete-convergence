import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '../infra/prisma.service';

describe('DispatchService', () => {
  let service: DispatchService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      dispatch: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
      vehicle: { findFirst: jest.fn() },
      driver: { findFirst: jest.fn(), update: jest.fn() },
      route: { findFirst: jest.fn() },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  describe('findAll', () => {
    it('should return paginated dispatches', async () => {
      const mockData = [{ id: 'd1', status: 'PENDING', tenantId: 't1' }];
      prisma.dispatch.findMany.mockResolvedValue(mockData);
      prisma.dispatch.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, pageSize: 10 });

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return dispatch when found', async () => {
      const mockDispatch = { id: 'd1', status: 'PENDING', tenantId: 't1', driverId: 'dr1' };
      prisma.dispatch.findFirst.mockResolvedValue(mockDispatch);

      const result = await service.findOne('d1', 't1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result).toEqual(mockDispatch);
    });

    it('should throw NotFoundException', async () => {
      prisma.dispatch.findFirst.mockResolvedValue(null);
      await expect(service.findOne('x', 't1')).rejects.toThrow(NotFoundException);
      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
    });
  });

  describe('dispatch (create)', () => {
    const dto = {
      vehicleId: 'v1',
      driverId: 'dr1',
      routeId: 'r1',
      scheduledAt: '2026-04-01T08:00:00Z',
    };

    it('should create a dispatch successfully', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      prisma.dispatch.count.mockResolvedValue(0);
      prisma.driver.findFirst.mockResolvedValue({ id: 'dr1', status: 'AVAILABLE' });
      prisma.route.findFirst.mockResolvedValue({ id: 'r1' });
      prisma.dispatch.create.mockResolvedValue({ id: 'd1', ...dto, status: 'PENDING', tenantId: 't1' });

      const result = await service.dispatch(dto, 't1', 'u1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.vehicle.findFirst).toHaveBeenCalledWith({ where: { id: 'v1', tenantId: 't1' } });
      expect(prisma.driver.findFirst).toHaveBeenCalledWith({ where: { id: 'dr1', tenantId: 't1' } });
      expect(prisma.route.findFirst).toHaveBeenCalledWith({ where: { id: 'r1', tenantId: 't1' } });
      expect(prisma.dispatch.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe('PENDING');
    });

    it('should reject if vehicle not found', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(service.dispatch(dto, 't1', 'u1')).rejects.toThrow(NotFoundException);
      expect(prisma.dispatch.create).not.toHaveBeenCalled();
    });

    it('should reject if vehicle not active', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'MAINTENANCE' });

      await expect(service.dispatch(dto, 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.dispatch.create).not.toHaveBeenCalled();
    });

    it('should reject if vehicle has active dispatch', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      prisma.dispatch.count.mockResolvedValue(1);

      await expect(service.dispatch(dto, 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.dispatch.create).not.toHaveBeenCalled();
    });

    it('should reject if driver not found', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      prisma.dispatch.count.mockResolvedValue(0);
      prisma.driver.findFirst.mockResolvedValue(null);

      await expect(service.dispatch(dto, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should reject if driver not available', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      prisma.dispatch.count.mockResolvedValue(0);
      prisma.driver.findFirst.mockResolvedValue({ id: 'dr1', status: 'ON_DUTY' });

      await expect(service.dispatch(dto, 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should reject if route not found', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      prisma.dispatch.count.mockResolvedValue(0);
      prisma.driver.findFirst.mockResolvedValue({ id: 'dr1', status: 'AVAILABLE' });
      prisma.route.findFirst.mockResolvedValue(null);

      await expect(service.dispatch(dto, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('assign', () => {
    it('should assign a PENDING dispatch', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', driverId: 'd1', tenantId: 't1' });
      prisma.dispatch.update.mockResolvedValue({ id: '1', status: 'ASSIGNED' });

      const result = await service.assign('1', 't1', 'u1');

      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { status: 'ON_DUTY' },
      });
      expect(prisma.dispatch.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ASSIGNED' }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe('ASSIGNED');
    });

    it('should throw if already assigned', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED', driverId: 'd1', tenantId: 't1' });
      await expect(service.assign('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.dispatch.update).not.toHaveBeenCalled();
    });

    it('should throw if not PENDING', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', driverId: 'd1', tenantId: 't1' });
      await expect(service.assign('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.driver.update).not.toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete an ASSIGNED dispatch', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED', driverId: 'd1', tenantId: 't1' });
      prisma.dispatch.update.mockResolvedValue({ id: '1', status: 'COMPLETED' });

      const result = await service.complete('1', 't1', 'u1');

      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { status: 'AVAILABLE' },
      });
      expect(prisma.dispatch.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe('COMPLETED');
    });

    it('should complete an IN_TRANSIT dispatch', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'IN_TRANSIT', driverId: 'd1', tenantId: 't1' });
      prisma.dispatch.update.mockResolvedValue({ id: '1', status: 'COMPLETED' });

      await service.complete('1', 't1', 'u1');

      expect(prisma.driver.update).toHaveBeenCalled();
      expect(prisma.dispatch.update).toHaveBeenCalled();
    });

    it('should throw if already completed', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', driverId: 'd1', tenantId: 't1' });
      await expect(service.complete('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.dispatch.update).not.toHaveBeenCalled();
    });

    it('should throw if cancelled', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', driverId: 'd1', tenantId: 't1' });
      await expect(service.complete('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.driver.update).not.toHaveBeenCalled();
    });

    it('should throw if still pending', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', driverId: 'd1', tenantId: 't1' });
      await expect(service.complete('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.dispatch.update).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel a PENDING dispatch without freeing driver', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', driverId: 'd1', tenantId: 't1' });
      prisma.dispatch.update.mockResolvedValue({ id: '1', status: 'CANCELLED' });

      const result = await service.cancel('1', 't1', 'u1');

      expect(prisma.driver.update).not.toHaveBeenCalled();
      expect(prisma.dispatch.update).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe('CANCELLED');
    });

    it('should cancel an ASSIGNED dispatch and free driver', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'ASSIGNED', driverId: 'd1', tenantId: 't1' });
      prisma.dispatch.update.mockResolvedValue({ id: '1', status: 'CANCELLED' });

      await service.cancel('1', 't1', 'u1');

      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { status: 'AVAILABLE' },
      });
    });

    it('should cancel an IN_TRANSIT dispatch and free driver', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'IN_TRANSIT', driverId: 'd1', tenantId: 't1' });
      prisma.dispatch.update.mockResolvedValue({ id: '1', status: 'CANCELLED' });

      await service.cancel('1', 't1', 'u1');

      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { status: 'AVAILABLE' },
      });
    });

    it('should throw if already cancelled', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', driverId: 'd1', tenantId: 't1' });
      await expect(service.cancel('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.dispatch.update).not.toHaveBeenCalled();
    });

    it('should throw if already completed', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', driverId: 'd1', tenantId: 't1' });
      await expect(service.cancel('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.dispatch.update).not.toHaveBeenCalled();
    });
  });
});
