// TRACED:VENUE-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from './venue.service';
import { PrismaService } from '../infra/prisma.module';

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
  const orgId = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VenueService>(VenueService);
  });

  describe('create', () => {
    it('should create a venue with organizationId', async () => {
      const dto = { name: 'Hall A', address: '123 Main St', capacity: 500 };
      mockPrisma.venue.create.mockResolvedValue({ id: 'v1', ...dto, organizationId: orgId });

      const result = await service.create(dto, orgId);
      expect(result.name).toBe('Hall A');
      expect(result.organizationId).toBe(orgId);
    });
  });

  describe('findAll', () => {
    it('should return paginated venues', async () => {
      mockPrisma.venue.findMany.mockResolvedValue([{ id: 'v1' }]);
      mockPrisma.venue.count.mockResolvedValue(1);

      const result = await service.findAll(orgId, 1, 10);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return venue when found', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue({ id: 'v1', name: 'Hall A' });
      const result = await service.findOne('v1', orgId);
      expect(result.name).toBe('Hall A');
    });

    it('should throw NotFoundException when venue not found', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', orgId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update venue capacity', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue({ id: 'v1', organizationId: orgId });
      mockPrisma.venue.update.mockResolvedValue({ id: 'v1', capacity: 1000 });

      const result = await service.update('v1', { capacity: 1000 }, orgId);
      expect(result.capacity).toBe(1000);
    });

    it('should update venue with all fields', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue({ id: 'v1', organizationId: orgId });
      mockPrisma.venue.update.mockResolvedValue({ id: 'v1', name: 'New', address: '456 Ave', capacity: 200 });

      await service.update('v1', { name: 'New', address: '456 Ave', capacity: 200 }, orgId);
      expect(mockPrisma.venue.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { name: 'New', address: '456 Ave', capacity: 200 },
      });
    });

    it('should throw NotFoundException when updating non-existent venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', { name: 'X' }, orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.venue.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue({ id: 'v1', organizationId: orgId });
      mockPrisma.venue.delete.mockResolvedValue({ id: 'v1' });

      const result = await service.remove('v1', orgId);
      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException when removing non-existent venue', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.venue.delete).not.toHaveBeenCalled();
    });
  });
});
