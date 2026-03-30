import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../infra/prisma.service';

describe('RouteService', () => {
  let service: RouteService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      route: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated routes', async () => {
      const mockData = [{ id: 'r1', name: 'Route A', tenantId: 't1' }];
      prisma.route.findMany.mockResolvedValue(mockData);
      prisma.route.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, pageSize: 10 });

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when route does not exist', async () => {
      prisma.route.findFirst.mockResolvedValue(null);
      await expect(service.findOne('x', 't1')).rejects.toThrow(NotFoundException);
      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.route.findFirst).toHaveBeenCalledWith({
        where: { id: 'x', tenantId: 't1' },
      });
    });

    it('should return route when found', async () => {
      const mockRoute = { id: '1', name: 'Route A', tenantId: 't1', origin: 'A', destination: 'B' };
      prisma.route.findFirst.mockResolvedValue(mockRoute);
      const result = await service.findOne('1', 't1');
      expect(result).toBeDefined();
      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.route.findFirst).toHaveBeenCalledWith({
        where: { id: '1', tenantId: 't1' },
      });
      // Verify service returns the found entity
      expect(result).toEqual(mockRoute);
    });
  });

  describe('create', () => {
    it('should create a route', async () => {
      const dto = { name: 'Route A', origin: 'Warehouse', destination: 'Customer', distance: 50, estimatedDuration: 60 };
      prisma.route.create.mockResolvedValue({ id: 'r1', ...dto, tenantId: 't1' });

      const result = await service.create(dto, 't1', 'u1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.route.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Route A', tenantId: 't1' }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.id).toBe('r1');
    });
  });

  describe('update', () => {
    it('should update a route', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: 'r1', name: 'Route A', tenantId: 't1' });
      prisma.route.update.mockResolvedValue({ id: 'r1', name: 'Route B', tenantId: 't1' });

      const result = await service.update('r1', { name: 'Route B' }, 't1', 'u1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.route.findFirst).toHaveBeenCalledWith({
        where: { id: 'r1', tenantId: 't1' },
      });
      expect(prisma.route.update).toHaveBeenCalledWith({ where: { id: 'r1' }, data: { name: 'Route B' } });
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'UPDATE', entity: 'Route' }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw if route not found', async () => {
      prisma.route.findFirst.mockResolvedValue(null);
      await expect(service.update('x', { name: 'Y' }, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a route', async () => {
      prisma.route.findFirst.mockResolvedValue({ id: 'r1', name: 'Route A', tenantId: 't1' });

      const result = await service.remove('r1', 't1', 'u1');

      expect(prisma.route.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'DELETE', entity: 'Route' }),
        }),
      );
      expect(result.deleted).toBe(true);
    });

    it('should throw if route not found', async () => {
      prisma.route.findFirst.mockResolvedValue(null);
      await expect(service.remove('x', 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
