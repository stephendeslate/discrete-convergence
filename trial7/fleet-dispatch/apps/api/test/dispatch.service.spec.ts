import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DispatchService } from '../src/dispatch/dispatch.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('DispatchService', () => {
  let service: DispatchService;
  const mockPrisma = {
    dispatch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a dispatch by id', async () => {
      const dispatch = {
        id: 'd1',
        tenantId: 'tenant-1',
        status: 'PENDING',
        vehicle: {},
        driver: {},
        route: {},
        dispatcher: {},
      };
      mockPrisma.dispatch.findUnique.mockResolvedValue(dispatch);

      const result = await service.findOne('d1', 'tenant-1');
      expect(result).toEqual(dispatch);
    });

    it('should throw NotFoundException for non-existent dispatch', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue(null);
      await expect(service.findOne('d999', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue({
        id: 'd1',
        tenantId: 'other-tenant',
      });
      await expect(service.findOne('d1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated dispatches', async () => {
      mockPrisma.dispatch.findMany.mockResolvedValue([]);
      mockPrisma.dispatch.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 10);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a dispatch', async () => {
      const dto = {
        tenantId: 'tenant-1',
        vehicleId: 'v1',
        driverId: 'd1',
        routeId: 'r1',
        scheduledAt: '2026-04-01T08:00:00Z',
      };
      mockPrisma.dispatch.create.mockResolvedValue({
        id: 'disp-1',
        ...dto,
        status: 'PENDING',
      });

      const result = await service.create(dto, 'user-1');
      expect(result.id).toBe('disp-1');
    });
  });

  describe('getDispatchStats', () => {
    it('should execute raw query for stats', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);
      const result = await service.getDispatchStats('tenant-1');
      expect(result).toHaveProperty('affectedRows');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for non-existent dispatch', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue(null);
      await expect(service.remove('d999', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
