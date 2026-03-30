// TRACED:API-DISPATCH-SERVICE-SPEC
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  dispatch: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  vehicle: { findFirst: jest.fn() },
  driver: { findFirst: jest.fn() },
  route: { findFirst: jest.fn() },
  setCompanyId: jest.fn(),
};

describe('DispatchService', () => {
  let service: DispatchService;
  const companyId = 'c1';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(DispatchService);
  });

  describe('create', () => {
    it('creates a dispatch when all entities are valid', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', status: 'AVAILABLE' });
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'r1' });
      mockPrisma.dispatch.create.mockResolvedValue({ id: 'dp1', status: 'PENDING' });

      const result = await service.create({
        vehicleId: 'v1',
        driverId: 'd1',
        routeId: 'r1',
        scheduledAt: '2024-01-01T00:00:00Z',
      }, companyId);

      expect(result.status).toBe('PENDING');
    });

    it('throws BadRequestException when vehicle is not ACTIVE', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'INACTIVE' });

      await expect(
        service.create({
          vehicleId: 'v1',
          driverId: 'd1',
          routeId: 'r1',
          scheduledAt: '2024-01-01T00:00:00Z',
        }, companyId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when driver is not AVAILABLE', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', status: 'ON_TRIP' });

      await expect(
        service.create({
          vehicleId: 'v1',
          driverId: 'd1',
          routeId: 'r1',
          scheduledAt: '2024-01-01T00:00:00Z',
        }, companyId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when vehicle not found', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          vehicleId: 'v1',
          driverId: 'd1',
          routeId: 'r1',
          scheduledAt: '2024-01-01T00:00:00Z',
        }, companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when driver not found', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      mockPrisma.driver.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          vehicleId: 'v1',
          driverId: 'd1',
          routeId: 'r1',
          scheduledAt: '2024-01-01T00:00:00Z',
        }, companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when route not found', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', status: 'AVAILABLE' });
      mockPrisma.route.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          vehicleId: 'v1',
          driverId: 'd1',
          routeId: 'r1',
          scheduledAt: '2024-01-01T00:00:00Z',
        }, companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates dispatch with explicit status', async () => {
      mockPrisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', status: 'AVAILABLE' });
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'r1' });
      mockPrisma.dispatch.create.mockResolvedValue({ id: 'dp1', status: 'DISPATCHED' });

      const result = await service.create({
        vehicleId: 'v1',
        driverId: 'd1',
        routeId: 'r1',
        scheduledAt: '2024-01-01T00:00:00Z',
        status: 'DISPATCHED' as never,
      }, companyId);

      expect(result.status).toBe('DISPATCHED');
    });
  });

  describe('update', () => {
    it('throws BadRequestException for completed dispatch', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue({
        id: 'dp1',
        companyId,
        status: 'COMPLETED',
      });

      await expect(
        service.update('dp1', { status: 'PENDING' as never }, companyId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for cancelled dispatch', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue({
        id: 'dp1',
        companyId,
        status: 'CANCELLED',
      });

      await expect(
        service.update('dp1', { status: 'PENDING' as never }, companyId),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates dispatch with multiple fields', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue({
        id: 'dp1',
        companyId,
        status: 'PENDING',
      });
      mockPrisma.dispatch.update.mockResolvedValue({ id: 'dp1', status: 'DISPATCHED' });

      const result = await service.update('dp1', {
        vehicleId: 'v2',
        driverId: 'd2',
        routeId: 'r2',
        scheduledAt: '2024-02-01T00:00:00Z',
        status: 'DISPATCHED' as never,
      }, companyId);

      expect(result.status).toBe('DISPATCHED');
      expect(mockPrisma.dispatch.update).toHaveBeenCalledWith({
        where: { id: 'dp1' },
        data: expect.objectContaining({
          vehicleId: 'v2',
          driverId: 'd2',
          routeId: 'r2',
          status: 'DISPATCHED',
        }),
      });
    });

    it('throws NotFoundException when dispatch not found for update', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue(null);
      await expect(
        service.update('missing', { status: 'PENDING' as never }, companyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns paginated dispatches', async () => {
      mockPrisma.dispatch.findMany.mockResolvedValue([{ id: 'dp1' }]);
      mockPrisma.dispatch.count.mockResolvedValue(1);

      const result = await service.findAll(companyId, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('returns a dispatch', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue({ id: 'dp1', companyId });
      const result = await service.findOne('dp1', companyId);
      expect(result.id).toBe('dp1');
    });

    it('throws NotFoundException for missing dispatch', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('sets dispatch status to CANCELLED', async () => {
      mockPrisma.dispatch.findFirst.mockResolvedValue({ id: 'dp1', companyId });
      mockPrisma.dispatch.update.mockResolvedValue({ id: 'dp1', status: 'CANCELLED' });

      const result = await service.remove('dp1', companyId);
      expect(result.status).toBe('CANCELLED');
    });
  });
});
