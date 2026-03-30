// TRACED:TRIP-SERVICE-SPEC
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TripService } from './trip.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  trip: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  dispatch: {
    findFirst: jest.fn(),
  },
  setCompanyId: jest.fn(),
};

describe('TripService', () => {
  let service: TripService;
  const companyId = 'c1';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TripService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(TripService);
  });

  describe('findAll', () => {
    it('returns paginated trips', async () => {
      mockPrisma.trip.findMany.mockResolvedValue([{ id: 'tr1' }]);
      mockPrisma.trip.count.mockResolvedValue(1);

      const result = await service.findAll(companyId, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.setCompanyId).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findOne', () => {
    it('returns a trip when found', async () => {
      mockPrisma.trip.findFirst.mockResolvedValue({ id: 'tr1', companyId, dispatch: {} });
      const result = await service.findOne('tr1', companyId);
      expect(result.id).toBe('tr1');
      expect(mockPrisma.setCompanyId).toHaveBeenCalledWith(companyId);
    });

    it('throws NotFoundException when trip not found (error path)', async () => {
      mockPrisma.trip.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.trip.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing', companyId } }),
      );
    });
  });

  describe('create', () => {
    it('creates a trip with companyId and all optional fields', async () => {
      const dto = {
        dispatchId: 'd1',
        startedAt: '2024-06-01T08:00:00Z',
        completedAt: '2024-06-01T10:00:00Z',
        distanceKm: 120,
        fuelUsedLiters: 15,
        notes: 'Smooth trip',
      };
      mockPrisma.dispatch.findFirst.mockResolvedValue({ id: 'd1', companyId });
      mockPrisma.trip.create.mockResolvedValue({ id: 'tr1', ...dto, companyId });

      const result = await service.create(dto, companyId);
      expect(result.dispatchId).toBe('d1');
      expect(mockPrisma.trip.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ dispatchId: 'd1', companyId }),
      });
    });

    it('creates trip with null optional fields when not provided', async () => {
      const dto = {
        dispatchId: 'd1',
        startedAt: '2024-06-01T08:00:00Z',
      };
      mockPrisma.dispatch.findFirst.mockResolvedValue({ id: 'd1', companyId });
      mockPrisma.trip.create.mockResolvedValue({
        id: 'tr2', ...dto, completedAt: null, distanceKm: null, fuelUsedLiters: null, notes: null, companyId,
      });

      const result = await service.create(dto, companyId);
      expect(result.completedAt).toBeNull();
      expect(result.distanceKm).toBeNull();
      expect(result.fuelUsedLiters).toBeNull();
      expect(result.notes).toBeNull();
      expect(mockPrisma.trip.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ completedAt: null, distanceKm: null, fuelUsedLiters: null, notes: null }),
      });
    });

    it('throws NotFoundException when dispatch not found (error path)', async () => {
      const dto = { dispatchId: 'bad-dispatch', startedAt: '2024-06-01T08:00:00Z' };
      mockPrisma.dispatch.findFirst.mockResolvedValue(null);
      await expect(service.create(dto, companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.trip.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates trip fields', async () => {
      mockPrisma.trip.findFirst.mockResolvedValue({ id: 'tr1', companyId });
      mockPrisma.trip.update.mockResolvedValue({ id: 'tr1', notes: 'Updated' });

      const result = await service.update('tr1', { notes: 'Updated' }, companyId);
      expect(result.notes).toBe('Updated');
      expect(mockPrisma.trip.update).toHaveBeenCalledWith({
        where: { id: 'tr1' },
        data: { notes: 'Updated' },
      });
    });

    it('updates with multiple partial fields', async () => {
      mockPrisma.trip.findFirst.mockResolvedValue({ id: 'tr1', companyId });
      mockPrisma.trip.update.mockResolvedValue({ id: 'tr1', distanceKm: 200, fuelUsedLiters: 25 });

      const result = await service.update('tr1', { distanceKm: 200, fuelUsedLiters: 25 }, companyId);
      expect(result.distanceKm).toBe(200);
      expect(result.fuelUsedLiters).toBe(25);
    });

    it('throws NotFoundException when updating non-existent trip (error path)', async () => {
      mockPrisma.trip.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', { notes: 'X' }, companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.trip.update).not.toHaveBeenCalled();
    });
  });
});
