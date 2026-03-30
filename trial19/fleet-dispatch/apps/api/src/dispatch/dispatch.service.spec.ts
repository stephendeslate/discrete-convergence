import { Test, TestingModule } from '@nestjs/testing';
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated dispatches for tenant', async () => {
      const mockDispatches = [{ id: 'disp-1', tenantId: 'tenant-1' }];
      mockPrisma.dispatch.findMany.mockResolvedValue(mockDispatches);
      mockPrisma.dispatch.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(mockPrisma.dispatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(mockPrisma.dispatch.count).toHaveBeenCalledWith({ where: { tenantId: 'tenant-1' } });
      expect(result.data).toEqual(mockDispatches);
      expect(result.total).toBe(1);
    });

    it('should clamp pagination to MAX_PAGE_SIZE', async () => {
      mockPrisma.dispatch.findMany.mockResolvedValue([]);
      mockPrisma.dispatch.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 500);

      expect(mockPrisma.dispatch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
      expect(result.limit).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return a dispatch by id and tenant', async () => {
      const mockDispatch = { id: 'disp-1', tenantId: 'tenant-1', status: 'PENDING' };
      mockPrisma.dispatch.findUnique.mockResolvedValue(mockDispatch);

      const result = await service.findOne('disp-1', 'tenant-1');

      expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith({
        where: { id: 'disp-1' },
        include: { vehicle: true, driver: true, route: true },
      });
      expect(result.status).toBe('PENDING');
    });

    it('should throw NotFoundException when dispatch not found', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue(null);

      await expect(service.findOne('disp-missing', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith({
        where: { id: 'disp-missing' },
        include: { vehicle: true, driver: true, route: true },
      });
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue({ id: 'disp-1', tenantId: 'other' });

      await expect(service.findOne('disp-1', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.dispatch.findUnique).toHaveBeenCalledWith({
        where: { id: 'disp-1' },
        include: { vehicle: true, driver: true, route: true },
      });
    });
  });

  describe('create', () => {
    it('should create a dispatch with tenant scope', async () => {
      const dto = {
        vehicleId: 'v-1',
        driverId: 'd-1',
        routeId: 'r-1',
        status: 'PENDING',
        scheduledAt: '2025-06-01T08:00:00Z',
      };
      mockPrisma.dispatch.create.mockResolvedValue({ id: 'disp-new', ...dto, tenantId: 'tenant-1' });

      const result = await service.create('tenant-1', dto);

      expect(mockPrisma.dispatch.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId: 'tenant-1', vehicleId: 'v-1' }),
        include: { vehicle: true, driver: true, route: true },
      });
      expect(result.id).toBe('disp-new');
    });
  });

  describe('update', () => {
    it('should update an existing dispatch', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue({ id: 'disp-1', tenantId: 'tenant-1' });
      mockPrisma.dispatch.update.mockResolvedValue({ id: 'disp-1', status: 'IN_PROGRESS' });

      const result = await service.update('disp-1', 'tenant-1', { status: 'IN_PROGRESS' });

      expect(mockPrisma.dispatch.update).toHaveBeenCalledWith({
        where: { id: 'disp-1' },
        data: expect.objectContaining({ status: 'IN_PROGRESS' }),
        include: { vehicle: true, driver: true, route: true },
      });
      expect(result.status).toBe('IN_PROGRESS');
    });
  });

  describe('remove', () => {
    it('should delete a dispatch', async () => {
      mockPrisma.dispatch.findUnique.mockResolvedValue({ id: 'disp-1', tenantId: 'tenant-1' });
      mockPrisma.dispatch.delete.mockResolvedValue({ id: 'disp-1' });

      const result = await service.remove('disp-1', 'tenant-1');

      expect(mockPrisma.dispatch.delete).toHaveBeenCalledWith({ where: { id: 'disp-1' } });
      expect(result.id).toBe('disp-1');
    });
  });
});
