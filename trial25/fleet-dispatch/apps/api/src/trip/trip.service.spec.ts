import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TripService } from './trip.service';
import { PrismaService } from '../infra/prisma.service';

describe('TripService', () => {
  let service: TripService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      trip: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
      dispatch: { findFirst: jest.fn(), update: jest.fn() },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TripService>(TripService);
  });

  describe('findAll', () => {
    it('should return paginated trips', async () => {
      const mockData = [{ id: 't1', dispatchId: 'd1', tenantId: 'tn1' }];
      prisma.trip.findMany.mockResolvedValue(mockData);
      prisma.trip.count.mockResolvedValue(1);

      const result = await service.findAll('tn1', { page: 1, pageSize: 10 });

      expect(prisma.setTenantContext).toHaveBeenCalledWith('tn1');
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return trip when found', async () => {
      const mockTrip = { id: 't1', dispatchId: 'd1', tenantId: 'tn1' };
      prisma.trip.findFirst.mockResolvedValue(mockTrip);

      const result = await service.findOne('t1', 'tn1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('tn1');
      expect(result).toEqual(mockTrip);
    });

    it('should throw NotFoundException', async () => {
      prisma.trip.findFirst.mockResolvedValue(null);
      await expect(service.findOne('x', 'tn1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = {
      dispatchId: 'd1',
      startLocation: 'Warehouse A',
      endLocation: 'Customer B',
      startTime: '2026-04-01T08:00:00Z',
    };

    it('should create a trip with ASSIGNED dispatch (transitions to IN_TRANSIT)', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: 'd1', status: 'ASSIGNED', tenantId: 'tn1' });
      prisma.trip.create.mockResolvedValue({ id: 'trip1', ...dto, tenantId: 'tn1' });

      const result = await service.create(dto, 'tn1', 'u1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('tn1');
      expect(prisma.dispatch.update).toHaveBeenCalledWith({
        where: { id: 'd1' },
        data: { status: 'IN_TRANSIT' },
      });
      expect(prisma.trip.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'CREATE', entity: 'Trip' }),
        }),
      );
      expect(result.id).toBe('trip1');
    });

    it('should create a trip with IN_TRANSIT dispatch (no status change)', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: 'd1', status: 'IN_TRANSIT', tenantId: 'tn1' });
      prisma.trip.create.mockResolvedValue({ id: 'trip2', ...dto, tenantId: 'tn1' });

      await service.create(dto, 'tn1', 'u1');

      expect(prisma.dispatch.update).not.toHaveBeenCalled();
      expect(prisma.trip.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when dispatch not found', async () => {
      prisma.dispatch.findFirst.mockResolvedValue(null);

      await expect(service.create(dto, 'tn1', 'u1')).rejects.toThrow(NotFoundException);
      expect(prisma.trip.create).not.toHaveBeenCalled();
    });

    it('should reject trip for cancelled dispatch', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: 'd1', status: 'CANCELLED', tenantId: 'tn1' });

      await expect(service.create(dto, 'tn1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.trip.create).not.toHaveBeenCalled();
    });

    it('should reject trip for completed dispatch', async () => {
      prisma.dispatch.findFirst.mockResolvedValue({ id: 'd1', status: 'COMPLETED', tenantId: 'tn1' });

      await expect(service.create(dto, 'tn1', 'u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should complete a trip with distance', async () => {
      prisma.trip.findFirst.mockResolvedValue({ id: 't1', status: 'IN_PROGRESS', tenantId: 'tn1' });
      prisma.trip.update.mockResolvedValue({ id: 't1', status: 'COMPLETED', distance: 42.5 });

      const result = await service.complete('t1', 42.5, 'tn1', 'u1');

      expect(prisma.trip.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED', distance: 42.5 }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe('COMPLETED');
    });

    it('should complete a trip without distance', async () => {
      prisma.trip.findFirst.mockResolvedValue({ id: 't1', status: 'IN_PROGRESS', tenantId: 'tn1' });
      prisma.trip.update.mockResolvedValue({ id: 't1', status: 'COMPLETED' });

      await service.complete('t1', undefined, 'tn1', 'u1');

      expect(prisma.trip.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED', distance: undefined }),
        }),
      );
    });

    it('should throw if already completed', async () => {
      prisma.trip.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', tenantId: 'tn1' });
      await expect(service.complete('1', undefined, 'tn1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.trip.update).not.toHaveBeenCalled();
    });

    it('should throw if cancelled', async () => {
      prisma.trip.findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', tenantId: 'tn1' });
      await expect(service.complete('1', undefined, 'tn1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.trip.update).not.toHaveBeenCalled();
    });
  });
});
