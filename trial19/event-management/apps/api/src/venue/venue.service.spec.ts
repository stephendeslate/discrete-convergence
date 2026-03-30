import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from './venue.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  venue: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('VenueService', () => {
  let service: VenueService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(VenueService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated venues for a tenant', async () => {
      const venues = [{ id: 'v-1', name: 'Venue A', tenantId: 'tenant-1' }];
      mockPrisma.venue.findMany.mockResolvedValue(venues);
      mockPrisma.venue.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);
      expect(mockPrisma.venue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result.data).toEqual(venues);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a venue by id and tenant', async () => {
      const venue = { id: 'v-1', name: 'Venue A', tenantId: 'tenant-1' };
      mockPrisma.venue.findFirst.mockResolvedValue(venue);

      const result = await service.findOne('v-1', 'tenant-1');
      expect(mockPrisma.venue.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'v-1', tenantId: 'tenant-1' } }),
      );
      expect(result).toEqual(venue);
    });

    it('should throw NotFoundException when venue not found', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.venue.findFirst).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a venue with tenant scope', async () => {
      const dto = { name: 'New Venue', address: '123 St', capacity: 200 };
      mockPrisma.venue.create.mockResolvedValue({ id: 'v-new', ...dto, tenantId: 'tenant-1' });

      const result = await service.create(dto, 'tenant-1');
      expect(mockPrisma.venue.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'New Venue', tenantId: 'tenant-1' }),
      });
      expect(result.name).toBe('New Venue');
    });
  });

  describe('update', () => {
    it('should update an existing venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue({ id: 'v-1', tenantId: 'tenant-1' });
      mockPrisma.venue.update.mockResolvedValue({ id: 'v-1', name: 'Updated', tenantId: 'tenant-1' });

      const result = await service.update('v-1', { name: 'Updated' }, 'tenant-1');
      expect(mockPrisma.venue.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'v-1' } }),
      );
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when updating non-existent venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);
      await expect(service.update('bad', { name: 'X' }, 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.venue.findFirst).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue({ id: 'v-1', tenantId: 'tenant-1' });
      mockPrisma.venue.delete.mockResolvedValue({ id: 'v-1' });

      await service.remove('v-1', 'tenant-1');
      expect(mockPrisma.venue.delete).toHaveBeenCalledWith({ where: { id: 'v-1' } });
      expect(mockPrisma.venue.findFirst).toHaveBeenCalled();
    });
  });
});
