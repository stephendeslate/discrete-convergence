import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { DeliveryService } from '../src/delivery/delivery.service';
import { PrismaService } from '../src/common/services/prisma.service';
import { mockPrismaService, TEST_TENANT_ID, TEST_DELIVERY_ID } from './helpers/setup';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        DeliveryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(DeliveryService);
  });

  describe('create', () => {
    it('should store cost as Decimal', async () => {
      const created = {
        id: TEST_DELIVERY_ID,
        trackingCode: 'DEL-100',
        cost: new Decimal(29.99),
        tenantId: TEST_TENANT_ID,
      };
      (prisma.delivery as unknown as { create: jest.Mock }).create.mockResolvedValue(created);

      const result = await service.create(
        {
          trackingCode: 'DEL-100',
          recipientName: 'Alice',
          address: '123 Main St',
          cost: 29.99,
        },
        TEST_TENANT_ID,
      );

      const createArg = (prisma.delivery as unknown as { create: jest.Mock }).create.mock.calls[0][0];
      expect(createArg.data.cost).toBeInstanceOf(Decimal);
      expect(createArg.data.cost.toNumber()).toBeCloseTo(29.99);
      expect(result.trackingCode).toBe('DEL-100');
    });
  });

  describe('findAll', () => {
    it('should filter by status when provided', async () => {
      (prisma.delivery as unknown as { findMany: jest.Mock }).findMany.mockResolvedValue([]);
      (prisma.delivery as unknown as { count: jest.Mock }).count.mockResolvedValue(0);

      await service.findAll(TEST_TENANT_ID, 1, 20, 'IN_TRANSIT');

      const findManyArg = (prisma.delivery as unknown as { findMany: jest.Mock }).findMany.mock.calls[0][0];
      expect(findManyArg.where.status).toBe('IN_TRANSIT');
      expect(findManyArg.where.tenantId).toBe(TEST_TENANT_ID);
    });

    it('should not include status filter when not provided', async () => {
      (prisma.delivery as unknown as { findMany: jest.Mock }).findMany.mockResolvedValue([]);
      (prisma.delivery as unknown as { count: jest.Mock }).count.mockResolvedValue(0);

      await service.findAll(TEST_TENANT_ID, 1, 20);

      const findManyArg = (prisma.delivery as unknown as { findMany: jest.Mock }).findMany.mock.calls[0][0];
      expect(findManyArg.where).toEqual({ tenantId: TEST_TENANT_ID });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for non-existent delivery', async () => {
      (prisma.delivery as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue(null);

      await expect(service.findOne(TEST_DELIVERY_ID, TEST_TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should include relations in response', async () => {
      (prisma.delivery as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: TEST_DELIVERY_ID,
        tenantId: TEST_TENANT_ID,
        driver: { name: 'John' },
        vehicle: { make: 'Ford' },
        route: { name: 'Express' },
      });

      const result = await service.findOne(TEST_DELIVERY_ID, TEST_TENANT_ID);

      const findArg = (prisma.delivery as unknown as { findUnique: jest.Mock }).findUnique.mock.calls[0][0];
      expect(findArg.include).toEqual({ driver: true, vehicle: true, route: true });
      expect(result.id).toBe(TEST_DELIVERY_ID);
    });
  });

  describe('update', () => {
    it('should convert cost to Decimal on update', async () => {
      (prisma.delivery as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: TEST_DELIVERY_ID,
        tenantId: TEST_TENANT_ID,
      });
      (prisma.delivery as unknown as { update: jest.Mock }).update.mockResolvedValue({
        id: TEST_DELIVERY_ID,
        cost: new Decimal(45.50),
      });

      await service.update(TEST_DELIVERY_ID, { cost: 45.50 }, TEST_TENANT_ID);

      const updateArg = (prisma.delivery as unknown as { update: jest.Mock }).update.mock.calls[0][0];
      expect(updateArg.data.cost).toBeInstanceOf(Decimal);
      expect(updateArg.data.cost.toNumber()).toBeCloseTo(45.50);
    });
  });
});
