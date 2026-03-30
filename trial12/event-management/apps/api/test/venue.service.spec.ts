import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from '../src/venue/venue.service';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: EM-VENUE-005
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

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockVenue = {
    id: 'venue-1',
    name: 'Test Venue',
    address: '123 Main St',
    city: 'San Francisco',
    capacity: 500,
    tenantId,
    events: [],
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
      const createDto = {
        name: 'New Venue',
        address: '456 Oak Ave',
        city: 'Portland',
        capacity: 200,
      };
      prisma.venue.create.mockResolvedValue(mockVenue);

      const result = await service.create(tenantId, createDto);

      expect(result).toEqual(mockVenue);
      expect(prisma.venue.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          address: createDto.address,
          city: createDto.city,
          capacity: createDto.capacity,
          tenantId,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated venues', async () => {
      prisma.venue.findMany.mockResolvedValue([mockVenue]);
      prisma.venue.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, 1, 20);

      expect(result.items).toEqual([mockVenue]);
      expect(result.total).toBe(1);
      expect(prisma.venue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });

    it('should clamp page size to max', async () => {
      prisma.venue.findMany.mockResolvedValue([]);
      prisma.venue.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId, 1, 500);

      expect(result.pageSize).toBe(100);
      expect(prisma.venue.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a venue by id', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);

      const result = await service.findOne(tenantId, 'venue-1');

      expect(result).toEqual(mockVenue);
      expect(prisma.venue.findFirst).toHaveBeenCalledWith({
        where: { id: 'venue-1', tenantId },
        include: { events: true },
      });
    });

    it('should throw NotFoundException when venue not found', async () => {
      prisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.venue.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId },
        include: { events: true },
      });
    });
  });

  describe('update', () => {
    it('should update a venue', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);
      prisma.venue.update.mockResolvedValue({ ...mockVenue, name: 'Updated Venue' });

      const result = await service.update(tenantId, 'venue-1', { name: 'Updated Venue' });

      expect(result.name).toBe('Updated Venue');
      expect(prisma.venue.update).toHaveBeenCalledWith({
        where: { id: 'venue-1' },
        data: { name: 'Updated Venue' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a venue', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);
      prisma.venue.delete.mockResolvedValue(mockVenue);

      const result = await service.remove(tenantId, 'venue-1');

      expect(result).toEqual(mockVenue);
      expect(prisma.venue.delete).toHaveBeenCalledWith({ where: { id: 'venue-1' } });
    });
  });
});
