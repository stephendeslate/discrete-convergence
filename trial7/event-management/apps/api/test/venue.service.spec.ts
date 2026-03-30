import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from '../src/venue/venue.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('VenueService', () => {
  let service: VenueService;

  const mockPrisma = {
    venue: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VenueService>(VenueService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should throw NotFoundException when venue not found', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return venue when found', async () => {
      const mockVenue = { id: 'v-1', name: 'Hall', tenantId: 'tenant-1' };
      mockPrisma.venue.findFirst.mockResolvedValue(mockVenue);
      const result = await service.findOne('v-1', 'tenant-1');
      expect(result).toEqual(mockVenue);
    });
  });

  describe('findAll', () => {
    it('should return empty results', async () => {
      mockPrisma.venue.findMany.mockResolvedValue([]);
      mockPrisma.venue.count.mockResolvedValue(0);
      const result = await service.findAll('tenant-1');
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a venue', async () => {
      const mockVenue = { id: 'v-1', name: 'New Venue', tenantId: 'tenant-1' };
      mockPrisma.venue.create.mockResolvedValue(mockVenue);
      const result = await service.create(
        { name: 'New Venue', address: '123 St', city: 'NYC', capacity: 100 },
        'tenant-1',
      );
      expect(result.name).toBe('New Venue');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for non-existent venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);
      await expect(service.remove('bad-id', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
