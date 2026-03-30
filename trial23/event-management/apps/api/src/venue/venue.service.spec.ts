import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from './venue.service';
import { PrismaService } from '../infra/prisma.service';

describe('VenueService', () => {
  let service: VenueService;
  let prisma: {
    venue: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      venue: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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

  it('should create a venue with organization scoping', async () => {
    const dto = { name: 'Main Hall', capacity: 500 };
    const expected = { id: 'ven-1', ...dto, organizationId: 'org-1' };
    prisma.venue.create.mockResolvedValue(expected);

    const result = await service.create('org-1', dto);
    expect(result).toEqual(expected);
    expect(prisma.venue.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ organizationId: 'org-1', capacity: 500 }),
    });
  });

  it('should return paginated venues', async () => {
    prisma.venue.findMany.mockResolvedValue([{ id: 'ven-1' }]);
    prisma.venue.count.mockResolvedValue(1);

    const result = await service.findAll('org-1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });

  it('should find one venue by id and organizationId', async () => {
    const venue = { id: 'ven-1', organizationId: 'org-1' };
    prisma.venue.findFirst.mockResolvedValue(venue);

    const result = await service.findOne('org-1', 'ven-1');
    expect(result).toEqual(venue);
  });

  it('should throw NotFoundException when venue not found', async () => {
    prisma.venue.findFirst.mockResolvedValue(null);

    await expect(service.findOne('org-1', 'ven-999')).rejects.toThrow(NotFoundException);
  });

  it('should update a venue', async () => {
    const venue = { id: 'ven-1', organizationId: 'org-1', name: 'Old' };
    prisma.venue.findFirst.mockResolvedValue(venue);
    prisma.venue.update.mockResolvedValue({ ...venue, name: 'Updated' });

    const result = await service.update('org-1', 'ven-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });
});
