import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from './venue.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  venue: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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

  it('should create a venue with tenant scoping', async () => {
    mockPrisma.venue.create.mockResolvedValue({ id: 'v-1', name: 'Hall A', tenantId: 'tenant-1' });

    const result = await service.create(
      { name: 'Hall A', address: '123 St', city: 'NYC', capacity: 500 },
      'tenant-1',
    );

    expect(mockPrisma.venue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Hall A', tenantId: 'tenant-1' }),
      }),
    );
    expect(result.id).toBe('v-1');
  });

  it('should find all venues with tenant scoping', async () => {
    mockPrisma.venue.findMany.mockResolvedValue([{ id: 'v-1' }]);
    mockPrisma.venue.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', 1, 10);

    expect(mockPrisma.venue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
    expect(result.data).toHaveLength(1);
  });

  it('should find one venue by id', async () => {
    mockPrisma.venue.findUnique.mockResolvedValue({ id: 'v-1', tenantId: 'tenant-1' });

    const result = await service.findOne('v-1', 'tenant-1');

    expect(mockPrisma.venue.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'v-1' } }),
    );
    expect(result.id).toBe('v-1');
  });

  it('should throw NotFoundException for non-existent venue', async () => {
    mockPrisma.venue.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.venue.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'missing' } }),
    );
  });

  it('should update a venue', async () => {
    mockPrisma.venue.findUnique.mockResolvedValue({ id: 'v-1', tenantId: 'tenant-1' });
    mockPrisma.venue.update.mockResolvedValue({ id: 'v-1', name: 'Updated' });

    const result = await service.update('v-1', { name: 'Updated' }, 'tenant-1');

    expect(mockPrisma.venue.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'v-1' } }),
    );
    expect(result.name).toBe('Updated');
  });

  it('should delete a venue', async () => {
    mockPrisma.venue.findUnique.mockResolvedValue({ id: 'v-1', tenantId: 'tenant-1' });
    mockPrisma.venue.delete.mockResolvedValue({ id: 'v-1' });

    await service.remove('v-1', 'tenant-1');

    expect(mockPrisma.venue.delete).toHaveBeenCalledWith({ where: { id: 'v-1' } });
  });
});
