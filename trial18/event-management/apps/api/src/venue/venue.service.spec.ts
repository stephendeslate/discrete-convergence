import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from './venue.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

jest.mock('../common/pagination.utils', () => ({
  getPaginationParams: jest
    .fn()
    .mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
}));

const mockPrisma = {
  venue: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
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

  const tenantId = 'tenant-1';

  describe('create', () => {
    it('should create a venue with tenantId', async () => {
      const dto = { name: 'Main Hall', address: '123 Street', capacity: 500 };
      const expected = { id: 'venue-1', ...dto, tenantId };
      mockPrisma.venue.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto as CreateVenueDto);

      expect(result).toEqual(expected);
      expect(mockPrisma.venue.create).toHaveBeenCalledWith({
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
    it('should return paginated venues with count', async () => {
      const venues = [{ id: 'venue-1' }];
      mockPrisma.venue.findMany.mockResolvedValue(venues);
      mockPrisma.venue.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result).toEqual({
        data: venues,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(mockPrisma.venue.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { events: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return venue when found', async () => {
      const venue = { id: 'venue-1', tenantId };
      mockPrisma.venue.findFirst.mockResolvedValue(venue);

      const result = await service.findOne(tenantId, 'venue-1');

      expect(result).toEqual(venue);
      expect(mockPrisma.venue.findFirst).toHaveBeenCalledWith({
        where: { id: 'venue-1', tenantId },
        include: { events: true },
      });
    });

    it('should throw NotFoundException when venue not found', async () => {
      mockPrisma.venue.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.venue.findFirst).toHaveBeenCalledWith({
        where: { id: 'missing', tenantId },
        include: { events: true },
      });
    });
  });

  describe('remove', () => {
    it('should find then delete the venue', async () => {
      const venue = { id: 'venue-1', tenantId };
      mockPrisma.venue.findFirst.mockResolvedValue(venue);
      mockPrisma.venue.delete.mockResolvedValue(venue);

      await service.remove(tenantId, 'venue-1');

      expect(mockPrisma.venue.delete).toHaveBeenCalledWith({
        where: { id: 'venue-1' },
      });
    });
  });
});
