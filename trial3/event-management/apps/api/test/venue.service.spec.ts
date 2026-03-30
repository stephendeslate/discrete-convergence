import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from '../src/venue/venue.service';
import { PrismaService } from '../src/prisma.service';

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

  beforeEach(async () => {
    prisma = {
      venue: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
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
      const mockVenue = { id: 'venue-1', name: 'Test Venue' };
      prisma.venue.create.mockResolvedValue(mockVenue);

      const result = await service.create(
        { name: 'Test Venue', capacity: 100 },
        'org-1',
      );

      expect(result).toEqual(mockVenue);
    });
  });

  describe('findAll', () => {
    it('should return paginated venues', async () => {
      prisma.venue.findMany.mockResolvedValue([
        { id: 'venue-1', name: 'Venue 1' },
      ]);
      prisma.venue.count.mockResolvedValue(1);

      const result = await service.findAll('org-1', { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a venue', async () => {
      prisma.venue.findUnique.mockResolvedValue({
        id: 'venue-1',
        organizationId: 'org-1',
      });

      const result = await service.findOne('venue-1', 'org-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException for wrong org', async () => {
      prisma.venue.findUnique.mockResolvedValue({
        id: 'venue-1',
        organizationId: 'other-org',
      });

      await expect(service.findOne('venue-1', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a venue', async () => {
      prisma.venue.findUnique.mockResolvedValue({
        id: 'venue-1',
        organizationId: 'org-1',
      });
      prisma.venue.update.mockResolvedValue({
        id: 'venue-1',
        name: 'Updated',
      });

      const result = await service.update(
        'venue-1',
        { name: 'Updated' },
        'org-1',
      );
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a venue', async () => {
      prisma.venue.findUnique.mockResolvedValue({
        id: 'venue-1',
        organizationId: 'org-1',
      });
      prisma.venue.delete.mockResolvedValue({});

      await expect(
        service.remove('venue-1', 'org-1'),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if venue not found', async () => {
      prisma.venue.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
