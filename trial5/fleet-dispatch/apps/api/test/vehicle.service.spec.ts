import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { VehicleService } from '../src/vehicle/vehicle.service';
import { PrismaService } from '../src/common/services/prisma.service';
import { mockPrismaService, TEST_TENANT_ID, TEST_VEHICLE_ID } from './helpers/setup';

describe('VehicleService', () => {
  let service: VehicleService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        VehicleService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(VehicleService);
  });

  describe('create', () => {
    it('should create vehicle with Decimal mileage', async () => {
      const created = {
        id: TEST_VEHICLE_ID,
        licensePlate: 'FL-999',
        make: 'Ford',
        model: 'Transit',
        year: 2024,
        status: 'AVAILABLE',
        mileage: new Decimal(15000),
        tenantId: TEST_TENANT_ID,
      };
      (prisma.vehicle as unknown as { create: jest.Mock }).create.mockResolvedValue(created);

      const result = await service.create(
        { licensePlate: 'FL-999', make: 'Ford', model: 'Transit', year: 2024, mileage: 15000 },
        TEST_TENANT_ID,
      );

      // Verify Decimal was used in the create call
      const createArg = (prisma.vehicle as unknown as { create: jest.Mock }).create.mock.calls[0][0];
      expect(createArg.data.mileage).toBeInstanceOf(Decimal);
      expect(createArg.data.mileage.toNumber()).toBe(15000);
      expect(result.licensePlate).toBe('FL-999');
    });
  });

  describe('findAll', () => {
    it('should compute totalPages correctly for partial pages', async () => {
      (prisma.vehicle as unknown as { findMany: jest.Mock }).findMany.mockResolvedValue([]);
      (prisma.vehicle as unknown as { count: jest.Mock }).count.mockResolvedValue(21);

      const result = await service.findAll(TEST_TENANT_ID, 1, 10);

      // 21 items / 10 per page = 3 pages (ceil)
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should reject cross-tenant access', async () => {
      (prisma.vehicle as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: TEST_VEHICLE_ID,
        tenantId: 'different-tenant',
      });

      await expect(service.findOne(TEST_VEHICLE_ID, TEST_TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should convert mileage to Decimal on update', async () => {
      (prisma.vehicle as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: TEST_VEHICLE_ID,
        tenantId: TEST_TENANT_ID,
      });
      (prisma.vehicle as unknown as { update: jest.Mock }).update.mockResolvedValue({
        id: TEST_VEHICLE_ID,
        mileage: new Decimal(20000),
      });

      await service.update(TEST_VEHICLE_ID, { mileage: 20000 }, TEST_TENANT_ID);

      const updateArg = (prisma.vehicle as unknown as { update: jest.Mock }).update.mock.calls[0][0];
      expect(updateArg.data.mileage).toBeInstanceOf(Decimal);
      expect(updateArg.data.mileage.toNumber()).toBe(20000);
    });
  });
});
