import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaModel } from './helpers/mock-prisma';

describe('DispatchService', () => {
  let service: DispatchService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      dispatch: createMockPrismaModel(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DispatchService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  it('should create a dispatch', async () => {
    prisma['dispatch'].create.mockResolvedValue({ id: '1', status: 'PENDING' });
    const result = await service.create('t1', {
      vehicleId: 'v1',
      driverId: 'd1',
      routeId: 'r1',
    });
    expect(result).toHaveProperty('id');
    expect(prisma['dispatch'].create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          vehicleId: 'v1',
          driverId: 'd1',
          routeId: 'r1',
          tenantId: 't1',
        }),
      }),
    );
  });

  it('should throw NotFoundException when dispatch not found', async () => {
    prisma['dispatch'].findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
    expect(prisma['dispatch'].findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bad-id', tenantId: 't1' },
      }),
    );
  });

  it('should return paginated results for findAll', async () => {
    prisma['dispatch'].findMany.mockResolvedValue([{ id: '1' }]);
    prisma['dispatch'].count.mockResolvedValue(1);
    const result = await service.findAll('t1', 1, 10);
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
  });

  it('should update a dispatch status', async () => {
    prisma['dispatch'].findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
    prisma['dispatch'].update.mockResolvedValue({ id: '1', status: 'IN_TRANSIT' });
    const result = await service.update('t1', '1', { status: 'IN_TRANSIT' });
    expect(result.status).toBe('IN_TRANSIT');
    expect(prisma['dispatch'].update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
  });

  it('should fail remove on non-existent dispatch', async () => {
    prisma['dispatch'].findFirst.mockResolvedValue(null);
    await expect(service.remove('t1', 'missing')).rejects.toThrow(NotFoundException);
    expect(prisma['dispatch'].findFirst).toHaveBeenCalled();
  });
});
