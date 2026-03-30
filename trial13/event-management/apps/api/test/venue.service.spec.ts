import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from '../src/venue/venue.service';
import { PrismaService } from '../src/infra/prisma.service';

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

describe('VenueService', () => {
  let service: VenueService;

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

  describe('create', () => {
    it('should create a venue with tenant scoping', async () => {
      const dto = { name: 'Hall A', address: '123 Main St', capacity: 200 };
      const expected = { id: '1', name: 'Hall A', tenantId: 'tenant-1' };
      mockPrisma.venue.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.venue.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Hall A', tenantId: 'tenant-1', capacity: 200 }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated venues', async () => {
      const venues = [{ id: '1', name: 'Hall A', tenantId: 'tenant-1' }];
      mockPrisma.venue.findMany.mockResolvedValue(venues);
      mockPrisma.venue.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(result.data).toEqual(venues);
      expect(result.total).toBe(1);
      expect(mockPrisma.venue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });

    it('should apply default pagination', async () => {
      mockPrisma.venue.findMany.mockResolvedValue([]);
      mockPrisma.venue.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');

      expect(result.page).toBe(1);
      expect(mockPrisma.venue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return venue by id and tenantId', async () => {
      const venue = { id: '1', name: 'Hall A', tenantId: 'tenant-1' };
      mockPrisma.venue.findFirst.mockResolvedValue(venue);

      const result = await service.findOne('tenant-1', '1');

      expect(result).toEqual(venue);
      expect(mockPrisma.venue.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1', tenantId: 'tenant-1' } }),
      );
    });

    it('should throw NotFoundException when venue not found', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.venue.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing', tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue({ id: '1', name: 'Old', tenantId: 'tenant-1' });
      mockPrisma.venue.update.mockResolvedValue({ id: '1', name: 'New', tenantId: 'tenant-1' });

      const result = await service.update('tenant-1', '1', { name: 'New' });

      expect(result.name).toBe('New');
      expect(mockPrisma.venue.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException for non-existent venue update', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.update('tenant-1', 'missing', { name: 'X' })).rejects.toThrow(NotFoundException);
      expect(mockPrisma.venue.findFirst).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
      mockPrisma.venue.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('tenant-1', '1');

      expect(result.id).toBe('1');
      expect(mockPrisma.venue.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when deleting non-existent venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.venue.findFirst).toHaveBeenCalled();
    });
  });
});
