import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from './venue.service';
import { PrismaService } from '../infra/prisma.service';

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
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        VenueService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(VenueService);
  });

  it('should create a venue', async () => {
    mockPrisma.venue.create.mockResolvedValue({ id: 'v1', name: 'Hall A', capacity: 500 });
    const result = await service.create({ name: 'Hall A', address: '123 Main', capacity: 500 }, 'org1');
    expect(result.name).toBe('Hall A');
    expect(result.capacity).toBe(500);
  });

  it('should return paginated venues', async () => {
    mockPrisma.venue.findMany.mockResolvedValue([{ id: 'v1' }]);
    mockPrisma.venue.count.mockResolvedValue(1);
    const result = await service.findAll('org1', 1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException for missing venue', async () => {
    mockPrisma.venue.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 'org1')).rejects.toThrow(NotFoundException);
  });

  it('should update a venue', async () => {
    mockPrisma.venue.findFirst.mockResolvedValue({ id: 'v1' });
    mockPrisma.venue.update.mockResolvedValue({ id: 'v1', name: 'Updated' });
    const result = await service.update('v1', { name: 'Updated' }, 'org1');
    expect(result.name).toBe('Updated');
  });

  it('should delete a venue', async () => {
    mockPrisma.venue.findFirst.mockResolvedValue({ id: 'v1' });
    mockPrisma.venue.delete.mockResolvedValue({ id: 'v1' });
    await service.remove('v1', 'org1');
    expect(mockPrisma.venue.delete).toHaveBeenCalledWith({ where: { id: 'v1' } });
  });
});
