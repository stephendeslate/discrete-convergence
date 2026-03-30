import { Test, TestingModule } from '@nestjs/testing';
import { VenueService } from './venue.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  venue: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('VenueService', () => {
  let service: VenueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VenueService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<VenueService>(VenueService);
    jest.clearAllMocks();
  });

  it('should return paginated venues', async () => {
    mockPrisma.venue.findMany.mockResolvedValue([{ id: '1', name: 'Hall' }]);
    mockPrisma.venue.count.mockResolvedValue(1);
    const result = await service.findAll('t1', { page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockPrisma.venue.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 't1' } }));
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.venue.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create venue with tenant', async () => {
    const dto = { name: 'Hall', address: '123 St', city: 'NYC', capacity: 500 };
    mockPrisma.venue.create.mockResolvedValue({ id: '1', ...dto, tenantId: 't1' });
    const result = await service.create('t1', dto);
    expect(result.id).toBe('1');
    expect(mockPrisma.venue.create).toHaveBeenCalledWith({ data: { ...dto, tenantId: 't1' } });
  });

  it('should delete venue after verifying ownership', async () => {
    mockPrisma.venue.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    mockPrisma.venue.delete.mockResolvedValue({ id: '1' });
    await service.remove('1', 't1');
    expect(mockPrisma.venue.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
