import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VenueService } from '../src/venue/venue.service';
import { PrismaService } from '../src/infra/prisma.service';

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

  const tenantId = 'tenant-1';

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

  it('should create a venue', async () => {
    const dto = { name: 'Hall A', address: '123 Main' };
    prisma.venue.create.mockResolvedValue({ id: '1', ...dto, tenantId });

    const result = await service.create(tenantId, dto);
    expect(result.name).toBe('Hall A');
    expect(prisma.venue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Hall A', tenantId }),
      }),
    );
  });

  it('should return paginated venues', async () => {
    prisma.venue.findMany.mockResolvedValue([{ id: '1' }]);
    prisma.venue.count.mockResolvedValue(1);

    const result = await service.findAll(tenantId);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(prisma.venue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId } }),
    );
  });

  it('should find one venue by id and tenant', async () => {
    prisma.venue.findFirst.mockResolvedValue({ id: '1', name: 'Found', tenantId });

    const result = await service.findOne(tenantId, '1');
    expect(result.name).toBe('Found');
    expect(prisma.venue.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1', tenantId } }),
    );
  });

  it('should throw NotFoundException when venue not found', async () => {
    prisma.venue.findFirst.mockResolvedValue(null);
    await expect(service.findOne(tenantId, 'bad')).rejects.toThrow(NotFoundException);
    expect(prisma.venue.findFirst).toHaveBeenCalled();
  });

  it('should update a venue', async () => {
    prisma.venue.findFirst.mockResolvedValue({ id: '1', tenantId });
    prisma.venue.update.mockResolvedValue({ id: '1', name: 'Updated' });

    const result = await service.update(tenantId, '1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
    expect(prisma.venue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ name: 'Updated' }),
      }),
    );
  });

  it('should delete a venue', async () => {
    prisma.venue.findFirst.mockResolvedValue({ id: '1', tenantId });
    prisma.venue.delete.mockResolvedValue({ id: '1' });

    await service.remove(tenantId, '1');
    expect(prisma.venue.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
