import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  dispatch: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DispatchService', () => {
  let service: DispatchService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(DispatchService);
    jest.clearAllMocks();
  });

  it('should find all dispatches with tenant scoping', async () => {
    mockPrisma.dispatch.findMany.mockResolvedValue([{ id: '1' }]);
    mockPrisma.dispatch.count.mockResolvedValue(1);
    const result = await service.findAll('t1', 1, 10);
    expect(mockPrisma.dispatch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1' } }),
    );
    expect(result.data).toHaveLength(1);
  });

  it('should find one dispatch by id with relations', async () => {
    mockPrisma.dispatch.findUnique.mockResolvedValue({ id: '1', tenantId: 't1', vehicle: {}, route: {}, driver: {} });
    const result = await service.findOne('1', 't1');
    expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' }, include: expect.any(Object) }),
    );
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException if dispatch not found', async () => {
    mockPrisma.dispatch.findUnique.mockResolvedValue(null);
    await expect(service.findOne('bad', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'bad' } }),
    );
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.dispatch.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
  });

  it('should create a dispatch', async () => {
    const dto = { vehicleId: 'v1', routeId: 'r1', driverId: 'd1', scheduledAt: '2024-01-01T00:00:00Z' };
    mockPrisma.dispatch.create.mockResolvedValue({ id: '2', ...dto, tenantId: 't1' });
    const result = await service.create(dto, 't1');
    expect(mockPrisma.dispatch.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 't1' }) }),
    );
    expect(result.id).toBe('2');
  });

  it('should update a dispatch', async () => {
    mockPrisma.dispatch.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    mockPrisma.dispatch.update.mockResolvedValue({ id: '1', status: 'ASSIGNED' });
    const result = await service.update('1', { status: 'ASSIGNED' }, 't1');
    expect(mockPrisma.dispatch.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.status).toBe('ASSIGNED');
  });

  it('should delete a dispatch', async () => {
    mockPrisma.dispatch.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    mockPrisma.dispatch.delete.mockResolvedValue({ id: '1' });
    await service.remove('1', 't1');
    expect(mockPrisma.dispatch.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
