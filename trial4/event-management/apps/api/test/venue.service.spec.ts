// TRACED:EM-TEST-005 — venue service unit test with mocked Prisma
import { VenueService } from '../src/venue/venue.service';
import { PrismaService } from '../src/common/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('VenueService', () => {
  let service: VenueService;
  let prisma: {
    venue: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      venue: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new VenueService(prisma as unknown as PrismaService);
  });

  describe('findOne', () => {
    it('should throw NotFoundException when venue not found', async () => {
      prisma.venue.findFirst.mockResolvedValue(null);
      await expect(service.findOne('id', 'org')).rejects.toThrow(NotFoundException);
    });

    it('should return venue when found', async () => {
      const mockVenue = { id: '1', name: 'Test Venue', organizationId: 'org' };
      prisma.venue.findFirst.mockResolvedValue(mockVenue);
      const result = await service.findOne('1', 'org');
      expect(result).toEqual(mockVenue);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.venue.findMany.mockResolvedValue([]);
      prisma.venue.count.mockResolvedValue(0);
      const result = await service.findAll('org', 1, 10);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a venue', async () => {
      const mockVenue = { id: '1', name: 'New Venue', capacity: 100 };
      prisma.venue.create.mockResolvedValue(mockVenue);
      const result = await service.create({ name: 'New Venue', capacity: 100 }, 'org');
      expect(result).toEqual(mockVenue);
    });
  });
});
