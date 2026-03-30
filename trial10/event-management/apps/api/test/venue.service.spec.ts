import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from '../src/venue/venue.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('VenueService', () => {
  let service: VenueService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const tenantId = 'tenant-1';
  const mockVenue = {
    id: 'venue-1',
    name: 'Test Venue',
    address: '123 Main St',
    capacity: 500,
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    prisma.$executeRaw.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<VenueService>(VenueService);
  });

  describe('create', () => {
    it('should create a venue for the tenant', async () => {
      const dto = { name: 'New Venue', address: '456 Oak Ave', capacity: 200 };
      prisma.venue.create.mockResolvedValue({ ...mockVenue, ...dto });

      const result = await service.create(tenantId, dto);
      expect(result.name).toBe(dto.name);
      expect(prisma.venue.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          address: dto.address,
          capacity: dto.capacity,
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
      expect(result.items).toHaveLength(1);
      expect(prisma.venue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return venue by id and tenant', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);

      const result = await service.findOne(tenantId, 'venue-1');
      expect(result.id).toBe('venue-1');
      expect(prisma.venue.findFirst).toHaveBeenCalledWith({
        where: { id: 'venue-1', tenantId },
        include: { events: true },
      });
    });

    it('should throw NotFoundException if venue not found', async () => {
      prisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent'))
        .rejects.toThrow(NotFoundException);
      expect(prisma.venue.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId },
        include: { events: true },
      });
    });
  });

  describe('update', () => {
    it('should update venue fields', async () => {
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
    it('should delete the venue', async () => {
      prisma.venue.findFirst.mockResolvedValue(mockVenue);
      prisma.venue.delete.mockResolvedValue(mockVenue);

      const result = await service.remove(tenantId, 'venue-1');
      expect(result.id).toBe('venue-1');
      expect(prisma.venue.delete).toHaveBeenCalledWith({ where: { id: 'venue-1' } });
    });

    it('should throw NotFoundException for non-existent venue', async () => {
      prisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
