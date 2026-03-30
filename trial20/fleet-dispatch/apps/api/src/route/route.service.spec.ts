import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  route: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('RouteService', () => {
  let service: RouteService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(RouteService);
    jest.clearAllMocks();
  });

  it('should find all routes with tenant scoping', async () => {
    mockPrisma.route.findMany.mockResolvedValue([{ id: '1', name: 'Route A' }]);
    mockPrisma.route.count.mockResolvedValue(1);
    const result = await service.findAll('t1', 1, 10);
    expect(mockPrisma.route.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1' } }),
    );
    expect(result.data).toHaveLength(1);
  });

  it('should find one route by id', async () => {
    mockPrisma.route.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    const result = await service.findOne('1', 't1');
    expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException if route not found', async () => {
    mockPrisma.route.findUnique.mockResolvedValue(null);
    await expect(service.findOne('bad', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({ where: { id: 'bad' } });
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.route.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should create a route', async () => {
    const dto = { name: 'Route B', origin: 'A', destination: 'B', distance: 100, estimatedTime: 60 };
    mockPrisma.route.create.mockResolvedValue({ id: '2', ...dto, tenantId: 't1' });
    const result = await service.create(dto, 't1');
    expect(mockPrisma.route.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 't1' }) }),
    );
    expect(result.name).toBe('Route B');
  });

  it('should update a route', async () => {
    mockPrisma.route.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    mockPrisma.route.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await service.update('1', { name: 'Updated' }, 't1');
    expect(mockPrisma.route.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.name).toBe('Updated');
  });

  it('should delete a route', async () => {
    mockPrisma.route.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    mockPrisma.route.delete.mockResolvedValue({ id: '1' });
    await service.remove('1', 't1');
    expect(mockPrisma.route.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
