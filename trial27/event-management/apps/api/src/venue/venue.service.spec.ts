// TRACED: EM-API-004 — Venue service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { VenueService } from './venue.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VenueService', () => {
  let service: VenueService;
  let prisma: {
    venue: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  const tenantId = 'tenant-1';
  const mockVenue = {
    id: 'venue-1',
    tenantId,
    name: 'Conference Hall',
    address: '123 Main St',
    capacity: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      venue: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
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
      prisma.venue.create.mockResolvedValue(mockVenue);

      const result = await service.create(tenantId, {
        name: 'Conference Hall',
        address: '123 Main St',
        capacity: 500,
      });

      expect(result).toEqual(mockVenue);
    });

    it('should throw if capacity is zero or negative', async () => {
      await expect(
        service.create(tenantId, { name: 'Hall', address: '123 St', capacity: 0 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated venues', async () => {
      prisma.venue.findMany.mockResolvedValue([mockVenue]);
      prisma.venue.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a venue by id', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);

      const result = await service.findOne(tenantId, 'venue-1');
      expect(result).toEqual(mockVenue);
    });

    it('should throw NotFoundException if venue not found', async () => {
      prisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a venue', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);
      prisma.venue.delete.mockResolvedValue(mockVenue);

      const result = await service.remove(tenantId, 'venue-1');
      expect(result).toEqual(mockVenue);
    });
  });

  describe('update', () => {
    it('should update a venue', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);
      prisma.venue.update.mockResolvedValue({ ...mockVenue, name: 'Updated Hall' });

      const result = await service.update(tenantId, 'venue-1', { name: 'Updated Hall' });
      expect(result.name).toBe('Updated Hall');
    });

    it('should throw error for invalid capacity (boundary: zero)', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);

      await expect(
        service.update(tenantId, 'venue-1', { capacity: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for invalid negative capacity', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);

      await expect(
        service.update(tenantId, 'venue-1', { capacity: -5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw not found when updating nonexistent venue', async () => {
      prisma.venue.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('edge cases', () => {
    it('should throw not found for invalid venue id', async () => {
      prisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should return empty result set when no venues exist', async () => {
      prisma.venue.findMany.mockResolvedValue([]);
      prisma.venue.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId);
      expect(result.data).toHaveLength(0);
    });

    it('should reject boundary capacity of negative one', async () => {
      await expect(
        service.create(tenantId, { name: 'Test', address: 'Addr', capacity: -1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw not found when removing nonexistent venue', async () => {
      prisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
