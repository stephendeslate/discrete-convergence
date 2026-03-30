import { Test, TestingModule } from '@nestjs/testing';
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated routes for tenant', async () => {
      const mockRoutes = [{ id: 'r-1', tenantId: 'tenant-1', name: 'Downtown' }];
      mockPrisma.route.findMany.mockResolvedValue(mockRoutes);
      mockPrisma.route.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(mockPrisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(mockPrisma.route.count).toHaveBeenCalledWith({ where: { tenantId: 'tenant-1' } });
      expect(result.data).toEqual(mockRoutes);
    });
  });

  describe('findOne', () => {
    it('should return a route by id and tenant', async () => {
      const mockRoute = { id: 'r-1', tenantId: 'tenant-1', name: 'Downtown Loop' };
      mockPrisma.route.findUnique.mockResolvedValue(mockRoute);

      const result = await service.findOne('r-1', 'tenant-1');

      expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({
        where: { id: 'r-1' },
        include: { dispatches: true },
      });
      expect(result.name).toBe('Downtown Loop');
    });

    it('should throw NotFoundException when route not found', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null);

      await expect(service.findOne('r-missing', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({
        where: { id: 'r-missing' },
        include: { dispatches: true },
      });
    });

    it('should throw NotFoundException when route belongs to different tenant', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({ id: 'r-1', tenantId: 'other-tenant' });

      await expect(service.findOne('r-1', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({
        where: { id: 'r-1' },
        include: { dispatches: true },
      });
    });
  });

  describe('create', () => {
    it('should create a route with tenant scope', async () => {
      const dto = { name: 'New Route', origin: 'A', destination: 'B', distance: 10.5, estimatedDuration: 20 };
      mockPrisma.route.create.mockResolvedValue({ id: 'r-new', ...dto, tenantId: 'tenant-1' });

      const result = await service.create('tenant-1', dto);

      expect(mockPrisma.route.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId: 'tenant-1', name: 'New Route' }),
      });
      expect(result.id).toBe('r-new');
    });
  });

  describe('update', () => {
    it('should update an existing route', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({ id: 'r-1', tenantId: 'tenant-1' });
      mockPrisma.route.update.mockResolvedValue({ id: 'r-1', name: 'Updated' });

      const result = await service.update('r-1', 'tenant-1', { name: 'Updated' });

      expect(mockPrisma.route.update).toHaveBeenCalledWith({
        where: { id: 'r-1' },
        data: expect.objectContaining({ name: 'Updated' }),
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a route', async () => {
      mockPrisma.route.findUnique.mockResolvedValue({ id: 'r-1', tenantId: 'tenant-1' });
      mockPrisma.route.delete.mockResolvedValue({ id: 'r-1' });

      const result = await service.remove('r-1', 'tenant-1');

      expect(mockPrisma.route.delete).toHaveBeenCalledWith({ where: { id: 'r-1' } });
      expect(result.id).toBe('r-1');
    });
  });
});
