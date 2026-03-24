import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { RouteService } from '../src/route/route.service';
import { PrismaService } from '../src/common/services/prisma.service';
import { mockPrismaService, TEST_TENANT_ID, TEST_ROUTE_ID } from './helpers/setup';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(RouteService);
  });

  describe('create', () => {
    it('should store distanceKm as Decimal', async () => {
      const created = {
        id: TEST_ROUTE_ID,
        name: 'Express',
        distanceKm: new Decimal(12.5),
        tenantId: TEST_TENANT_ID,
      };
      (prisma.route as unknown as { create: jest.Mock }).create.mockResolvedValue(created);

      const result = await service.create(
        {
          name: 'Express',
          origin: 'A',
          destination: 'B',
          distanceKm: 12.5,
          estimatedMinutes: 20,
        },
        TEST_TENANT_ID,
      );

      const createArg = (prisma.route as unknown as { create: jest.Mock }).create.mock.calls[0][0];
      expect(createArg.data.distanceKm).toBeInstanceOf(Decimal);
      expect(createArg.data.distanceKm.toNumber()).toBeCloseTo(12.5);
      expect(result.name).toBe('Express');
    });

    it('should default waypoints to empty array', async () => {
      (prisma.route as unknown as { create: jest.Mock }).create.mockResolvedValue({ id: TEST_ROUTE_ID });

      await service.create(
        { name: 'Route', origin: 'A', destination: 'B', distanceKm: 5, estimatedMinutes: 10 },
        TEST_TENANT_ID,
      );

      const createArg = (prisma.route as unknown as { create: jest.Mock }).create.mock.calls[0][0];
      expect(createArg.data.waypoints).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should enforce tenant isolation', async () => {
      (prisma.route as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: TEST_ROUTE_ID,
        tenantId: 'other-tenant',
      });

      await expect(service.findOne(TEST_ROUTE_ID, TEST_TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should convert distanceKm to Decimal on update', async () => {
      (prisma.route as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: TEST_ROUTE_ID,
        tenantId: TEST_TENANT_ID,
      });
      (prisma.route as unknown as { update: jest.Mock }).update.mockResolvedValue({
        id: TEST_ROUTE_ID,
        distanceKm: new Decimal(25),
      });

      await service.update(TEST_ROUTE_ID, { distanceKm: 25 }, TEST_TENANT_ID);

      const updateArg = (prisma.route as unknown as { update: jest.Mock }).update.mock.calls[0][0];
      expect(updateArg.data.distanceKm).toBeInstanceOf(Decimal);
    });

    it('should only update provided fields', async () => {
      (prisma.route as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: TEST_ROUTE_ID,
        tenantId: TEST_TENANT_ID,
      });
      (prisma.route as unknown as { update: jest.Mock }).update.mockResolvedValue({
        id: TEST_ROUTE_ID,
      });

      await service.update(TEST_ROUTE_ID, { name: 'Updated' }, TEST_TENANT_ID);

      const updateArg = (prisma.route as unknown as { update: jest.Mock }).update.mock.calls[0][0];
      expect(updateArg.data).toEqual({ name: 'Updated' });
    });
  });
});
