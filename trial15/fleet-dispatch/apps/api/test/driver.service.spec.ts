import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from '../src/driver/driver.service';
import { PrismaService } from '../src/infra/prisma.service';
import { mockPrismaService, mockTenantId } from './helpers/test-utils';

describe('DriverService', () => {
  let service: DriverService;
  let prisma: ReturnType<typeof mockPrismaService>;

  beforeEach(async () => {
    prisma = mockPrismaService();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DriverService>(DriverService);
  });

  describe('create', () => {
    it('should create a driver', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@test.com',
        phone: '555-0101',
        licenseNumber: 'DL-001',
      };
      const mockDriver = { id: 'd1', ...dto, tenantId: mockTenantId };
      prisma.driver.create.mockResolvedValue(mockDriver);

      const result = await service.create(mockTenantId, dto);

      expect(result).toEqual(mockDriver);
      expect(prisma.driver.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            firstName: dto.firstName,
            tenantId: mockTenantId,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated drivers', async () => {
      const mockDrivers = [
        { id: 'd1', firstName: 'John', tenantId: mockTenantId },
        { id: 'd2', firstName: 'Jane', tenantId: mockTenantId },
      ];
      prisma.driver.findMany.mockResolvedValue(mockDrivers);
      prisma.driver.count.mockResolvedValue(2);

      const result = await service.findAll(mockTenantId);

      expect(result.data).toEqual(mockDrivers);
      expect(result.total).toBe(2);
      expect(prisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: mockTenantId },
        }),
      );
    });

    it('should respect page size limits', async () => {
      prisma.driver.findMany.mockResolvedValue([]);
      prisma.driver.count.mockResolvedValue(0);

      const result = await service.findAll(mockTenantId, 1, 200);

      expect(result.pageSize).toBe(100);
      expect(prisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a driver by id', async () => {
      const mockDriver = { id: 'd1', firstName: 'John', tenantId: mockTenantId };
      prisma.driver.findUnique.mockResolvedValue(mockDriver);

      const result = await service.findOne(mockTenantId, 'd1');

      expect(result).toEqual(mockDriver);
      expect(prisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'd1' },
      });
    });

    it('should throw NotFoundException for missing driver', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockTenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.driver.findUnique.mockResolvedValue({
        id: 'd1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne(mockTenantId, 'd1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'd1' },
      });
    });
  });

  describe('update', () => {
    it('should update a driver', async () => {
      const existing = { id: 'd1', firstName: 'Old', tenantId: mockTenantId };
      const updated = { id: 'd1', firstName: 'New', tenantId: mockTenantId };
      prisma.driver.findUnique.mockResolvedValue(existing);
      prisma.driver.update.mockResolvedValue(updated);

      const result = await service.update(mockTenantId, 'd1', {
        firstName: 'New',
      });

      expect(result).toEqual(updated);
      expect(prisma.driver.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'd1' },
        }),
      );
    });

    it('should throw NotFoundException when updating non-existent driver', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockTenantId, 'nonexistent', { firstName: 'New' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.driver.findUnique).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a driver', async () => {
      const existing = { id: 'd1', tenantId: mockTenantId };
      prisma.driver.findUnique.mockResolvedValue(existing);
      prisma.driver.delete.mockResolvedValue(existing);

      const result = await service.remove(mockTenantId, 'd1');

      expect(result).toEqual(existing);
      expect(prisma.driver.delete).toHaveBeenCalledWith({
        where: { id: 'd1' },
      });
    });

    it('should throw NotFoundException when deleting non-existent driver', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.remove(mockTenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.driver.findUnique).toHaveBeenCalled();
    });
  });
});
