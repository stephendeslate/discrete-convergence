import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from '../src/venue/venue.service';
import { PrismaService } from '../src/common/prisma.service';

describe('VenueService', () => {
  let service: VenueService;
  let prisma: {
    venue: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockVenue = {
    id: 'venue-1',
    name: 'Grand Hall',
    address: '123 Main St',
    capacity: 500,
    tenantId: testTenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    events: [],
  };

  beforeEach(async () => {
    prisma = {
      venue: {
        create: jest.fn().mockResolvedValue(mockVenue),
        findMany: jest.fn().mockResolvedValue([mockVenue]),
        findUnique: jest.fn().mockResolvedValue(mockVenue),
        update: jest.fn().mockResolvedValue({ ...mockVenue, name: 'Updated Hall' }),
        delete: jest.fn().mockResolvedValue(mockVenue),
        count: jest.fn().mockResolvedValue(1),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<VenueService>(VenueService);
  });

  describe('create', () => {
    it('should create a venue', async () => {
      const result = await service.create(testTenantId, {
        name: 'Grand Hall',
        address: '123 Main St',
        capacity: 500,
      });

      expect(result.name).toBe('Grand Hall');
      expect(prisma.venue.create).toHaveBeenCalledWith({
        data: { name: 'Grand Hall', address: '123 Main St', capacity: 500, tenantId: testTenantId },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated venues', async () => {
      const result = await service.findAll(testTenantId, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(prisma.venue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: testTenantId },
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a venue by id', async () => {
      const result = await service.findOne(testTenantId, 'venue-1');

      expect(result.id).toBe('venue-1');
      expect(prisma.venue.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'venue-1' } }),
      );
    });

    it('should throw NotFoundException for non-existent venue', async () => {
      prisma.venue.findUnique.mockResolvedValue(null);

      await expect(service.findOne(testTenantId, 'not-found')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.venue.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'not-found' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.venue.findUnique.mockResolvedValue({ ...mockVenue, tenantId: 'other' });

      await expect(service.findOne(testTenantId, 'venue-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.venue.findUnique).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a venue', async () => {
      const result = await service.update(testTenantId, 'venue-1', { name: 'Updated Hall' });

      expect(result.name).toBe('Updated Hall');
      expect(prisma.venue.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'venue-1' } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a venue', async () => {
      const result = await service.remove(testTenantId, 'venue-1');

      expect(result.id).toBe('venue-1');
      expect(prisma.venue.delete).toHaveBeenCalledWith({ where: { id: 'venue-1' } });
    });
  });
});
