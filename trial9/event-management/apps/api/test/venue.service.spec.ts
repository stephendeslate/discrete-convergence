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

  const tenantId = 'tenant-1';
  const mockVenue = {
    id: 'venue-1',
    name: 'Test Venue',
    address: '123 Test St',
    capacity: 500,
    tenantId,
    events: [],
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
      prisma.venue.create.mockResolvedValue(mockVenue);
      const dto = { name: 'Test Venue', address: '123 Test St', capacity: 500 };

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(mockVenue);
      expect(prisma.venue.create).toHaveBeenCalledWith({
        data: { ...dto, tenantId },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated venues', async () => {
      prisma.venue.findMany.mockResolvedValue([mockVenue]);
      prisma.venue.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result.items).toEqual([mockVenue]);
      expect(result.total).toBe(1);
      expect(prisma.venue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId } }),
      );
    });
  });

  describe('findOne', () => {
    it('should find a venue by id', async () => {
      prisma.venue.findUnique.mockResolvedValue(mockVenue);
      const result = await service.findOne(tenantId, 'venue-1');
      expect(result).toEqual(mockVenue);
      expect(prisma.venue.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'venue-1' } }),
      );
    });

    it('should throw NotFoundException for non-existent venue', async () => {
      prisma.venue.findUnique.mockResolvedValue(null);
      await expect(service.findOne(tenantId, 'invalid')).rejects.toThrow(NotFoundException);
      expect(prisma.venue.findUnique).toHaveBeenCalled();
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.venue.findUnique.mockResolvedValue({ ...mockVenue, tenantId: 'other' });
      await expect(service.findOne(tenantId, 'venue-1')).rejects.toThrow(NotFoundException);
      expect(prisma.venue.findUnique).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a venue', async () => {
      prisma.venue.findUnique.mockResolvedValue(mockVenue);
      prisma.venue.update.mockResolvedValue({ ...mockVenue, name: 'Updated Venue' });

      const result = await service.update(tenantId, 'venue-1', { name: 'Updated Venue' });

      expect(result.name).toBe('Updated Venue');
      expect(prisma.venue.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'venue-1' } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a venue', async () => {
      prisma.venue.findUnique.mockResolvedValue(mockVenue);
      prisma.venue.delete.mockResolvedValue(mockVenue);

      const result = await service.remove(tenantId, 'venue-1');

      expect(result).toEqual(mockVenue);
      expect(prisma.venue.delete).toHaveBeenCalledWith({ where: { id: 'venue-1' } });
    });
  });
});
