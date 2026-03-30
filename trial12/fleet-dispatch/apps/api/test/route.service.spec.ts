import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from '../src/route/route.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: {
    route: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    prisma = {
      route: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  describe('create', () => {
    it('should create a route', async () => {
      const dto = { name: 'Downtown Loop', distance: 25.5, estimatedTime: 120 };
      const expected = { id: '1', ...dto, tenantId };
      prisma.route.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(expected);
      expect(prisma.route.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ tenantId }) }),
      );
    });
  });

  describe('findAll', () => {
    it('should return routes for tenant', async () => {
      const routes = [{ id: '1', tenantId }];
      prisma.route.findMany.mockResolvedValue(routes);

      const result = await service.findAll(tenantId, 1, 10);

      expect(result).toEqual(routes);
      expect(prisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId }, skip: 0, take: 10 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a route by id', async () => {
      const route = { id: '1', tenantId };
      prisma.route.findUnique.mockResolvedValue(route);

      const result = await service.findOne(tenantId, '1');

      expect(result).toEqual(route);
      expect(prisma.route.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException for missing route', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(prisma.route.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.route.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });

      await expect(service.findOne(tenantId, '1')).rejects.toThrow(NotFoundException);
      expect(prisma.route.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update a route', async () => {
      prisma.route.findUnique.mockResolvedValue({ id: '1', tenantId });
      prisma.route.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update(tenantId, '1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
      expect(prisma.route.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a route', async () => {
      prisma.route.findUnique.mockResolvedValue({ id: '1', tenantId });
      prisma.route.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove(tenantId, '1');

      expect(result).toEqual({ id: '1' });
      expect(prisma.route.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException for non-existent route delete', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(prisma.route.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad' } }),
      );
    });
  });
});
