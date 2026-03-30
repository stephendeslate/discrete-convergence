import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from '../src/driver/driver.service';
import { PrismaService } from '../src/common/prisma.service';

describe('DriverService', () => {
  let service: DriverService;
  const tenantId = 'tenant-1';

  const mockPrisma = {
    driver: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DriverService>(DriverService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a driver with tenant context', async () => {
      const dto = { name: 'John', licenseNumber: 'DL-001', phone: '+1-555-0101' };
      const expected = { id: 'd-1', ...dto, tenantId, status: 'ACTIVE' };
      mockPrisma.driver.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.driver.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId, name: 'John' }),
      });
    });
  });

  describe('findAll', () => {
    it('should return drivers for tenant', async () => {
      const drivers = [{ id: 'd-1', name: 'John', tenantId }];
      mockPrisma.driver.findMany.mockResolvedValue(drivers);

      const result = await service.findAll(tenantId, 1, 10);

      expect(result).toEqual(drivers);
      expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should use default pagination', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a driver with dispatches', async () => {
      const driver = { id: 'd-1', name: 'John', tenantId, dispatches: [] };
      mockPrisma.driver.findFirst.mockResolvedValue(driver);

      const result = await service.findOne(tenantId, 'd-1');

      expect(result).toEqual(driver);
      expect(mockPrisma.driver.findFirst).toHaveBeenCalledWith({
        where: { id: 'd-1', tenantId },
        include: { dispatches: true },
      });
    });

    it('should throw NotFoundException when driver not found', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.driver.findFirst).toHaveBeenCalledWith({
        where: { id: 'bad', tenantId },
        include: { dispatches: true },
      });
    });
  });

  describe('update', () => {
    it('should update a driver', async () => {
      const driver = { id: 'd-1', name: 'John', tenantId, dispatches: [] };
      mockPrisma.driver.findFirst.mockResolvedValue(driver);
      mockPrisma.driver.update.mockResolvedValue({ ...driver, name: 'Jane' });

      const result = await service.update(tenantId, 'd-1', { name: 'Jane' });

      expect(result.name).toBe('Jane');
      expect(mockPrisma.driver.update).toHaveBeenCalledWith({
        where: { id: 'd-1' },
        data: { name: 'Jane' },
      });
    });

    it('should throw NotFoundException when updating non-existent driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);

      await expect(service.update(tenantId, 'bad', { name: 'X' })).rejects.toThrow(NotFoundException);
      expect(mockPrisma.driver.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd-1', tenantId, dispatches: [] });
      mockPrisma.driver.delete.mockResolvedValue({ id: 'd-1' });

      const result = await service.remove(tenantId, 'd-1');

      expect(result.id).toBe('d-1');
      expect(mockPrisma.driver.delete).toHaveBeenCalledWith({ where: { id: 'd-1' } });
    });

    it('should throw NotFoundException when deleting non-existent driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.driver.delete).not.toHaveBeenCalled();
    });
  });
});
