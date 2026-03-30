import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from '../src/driver/driver.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('DriverService', () => {
  let service: DriverService;
  const mockPrisma = createMockPrismaService();
  const tenantId = 'test-tenant-001';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DriverService>(DriverService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a driver', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@fleet.test',
        phone: '+1-555-0100',
        licenseNumber: 'DL-123',
        hourlyRate: 25,
      };
      const expected = { id: 'd-1', ...dto, tenantId, status: 'AVAILABLE' };
      mockPrisma.driver.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.driver.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId, name: 'John Doe' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated drivers', async () => {
      const mockDrivers = [{ id: 'd-1', tenantId, name: 'John' }];
      mockPrisma.driver.findMany.mockResolvedValue(mockDrivers);
      mockPrisma.driver.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, '1', '10');
      expect(result.items).toEqual(mockDrivers);
      expect(result.total).toBe(1);
      expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should return empty when no drivers exist', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([]);
      mockPrisma.driver.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId);
      expect(result.items).toEqual([]);
      expect(mockPrisma.driver.count).toHaveBeenCalledWith({ where: { tenantId } });
    });
  });

  describe('findOne', () => {
    it('should return a driver by id', async () => {
      const mockDriver = { id: 'd-1', tenantId, name: 'John' };
      mockPrisma.driver.findUnique.mockResolvedValue(mockDriver);

      const result = await service.findOne(tenantId, 'd-1');
      expect(result).toEqual(mockDriver);
      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'd-1' },
        include: { dispatches: true },
      });
    });

    it('should throw NotFoundException for nonexistent driver', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'bad-id')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'bad-id' },
        include: { dispatches: true },
      });
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        id: 'd-1',
        tenantId: 'other-tenant',
      });

      await expect(service.findOne(tenantId, 'd-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a driver', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ id: 'd-1', tenantId });
      const updated = { id: 'd-1', tenantId, name: 'Jane Doe' };
      mockPrisma.driver.update.mockResolvedValue(updated);

      const result = await service.update(tenantId, 'd-1', { name: 'Jane Doe' });
      expect(result).toEqual(updated);
      expect(mockPrisma.driver.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'd-1' } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a driver', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ id: 'd-1', tenantId });
      mockPrisma.driver.delete.mockResolvedValue({ id: 'd-1' });

      const result = await service.remove(tenantId, 'd-1');
      expect(result).toEqual({ id: 'd-1' });
      expect(mockPrisma.driver.delete).toHaveBeenCalledWith({ where: { id: 'd-1' } });
    });

    it('should throw NotFoundException when removing nonexistent driver', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.remove(tenantId, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
