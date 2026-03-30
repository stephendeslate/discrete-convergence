import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from '../src/driver/driver.service';
import { PrismaService } from '../src/common/services/prisma.service';
import { mockPrismaService, TEST_TENANT_ID, TEST_DRIVER_ID } from './helpers/setup';

describe('DriverService', () => {
  let service: DriverService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();
    const module = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(DriverService);
  });

  describe('create', () => {
    it('should create a driver with the provided tenant ID', async () => {
      const created = {
        id: TEST_DRIVER_ID,
        name: 'John',
        licenseNumber: 'DL-123',
        phone: '+1-555-0001',
        available: true,
        vehicleId: null,
        tenantId: TEST_TENANT_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.driver as unknown as { create: jest.Mock }).create.mockResolvedValue(created);

      const result = await service.create(
        { name: 'John', licenseNumber: 'DL-123', phone: '+1-555-0001' },
        TEST_TENANT_ID,
      );

      expect(result.tenantId).toBe(TEST_TENANT_ID);
      expect(result.name).toBe('John');
    });
  });

  describe('findAll', () => {
    it('should return paginated results with computed totalPages', async () => {
      const drivers = Array.from({ length: 3 }, (_, i) => ({
        id: `driver-${i}`,
        name: `Driver ${i}`,
        tenantId: TEST_TENANT_ID,
      }));
      (prisma.driver as unknown as { findMany: jest.Mock }).findMany.mockResolvedValue(drivers);
      (prisma.driver as unknown as { count: jest.Mock }).count.mockResolvedValue(25);

      const result = await service.findAll(TEST_TENANT_ID, 1, 10);

      expect(result.meta.total).toBe(25);
      expect(result.meta.totalPages).toBe(3); // ceil(25/10)
      expect(result.meta.page).toBe(1);
      expect(result.meta.pageSize).toBe(10);
      expect(result.data).toHaveLength(3);
    });

    it('should clamp page size to maximum 100', async () => {
      (prisma.driver as unknown as { findMany: jest.Mock }).findMany.mockResolvedValue([]);
      (prisma.driver as unknown as { count: jest.Mock }).count.mockResolvedValue(0);

      const result = await service.findAll(TEST_TENANT_ID, 1, 500);

      expect(result.meta.pageSize).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for wrong tenant', async () => {
      (prisma.driver as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: TEST_DRIVER_ID,
        tenantId: 'other-tenant-id',
      });

      await expect(service.findOne(TEST_DRIVER_ID, TEST_TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return driver when tenant matches', async () => {
      const driver = {
        id: TEST_DRIVER_ID,
        name: 'John',
        tenantId: TEST_TENANT_ID,
      };
      (prisma.driver as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue(driver);

      const result = await service.findOne(TEST_DRIVER_ID, TEST_TENANT_ID);
      expect(result.id).toBe(TEST_DRIVER_ID);
    });
  });

  describe('remove', () => {
    it('should delete driver after verifying tenant ownership', async () => {
      (prisma.driver as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
        id: TEST_DRIVER_ID,
        tenantId: TEST_TENANT_ID,
      });
      (prisma.driver as unknown as { delete: jest.Mock }).delete.mockResolvedValue({
        id: TEST_DRIVER_ID,
      });

      const result = await service.remove(TEST_DRIVER_ID, TEST_TENANT_ID);
      expect(result.id).toBe(TEST_DRIVER_ID);
    });
  });
});
