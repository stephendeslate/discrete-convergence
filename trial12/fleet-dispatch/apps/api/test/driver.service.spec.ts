import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from '../src/driver/driver.service';
import { PrismaService } from '../src/infra/prisma.service';

describe('DriverService', () => {
  let service: DriverService;
  let prisma: {
    driver: {
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
      driver: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

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
      const dto = { name: 'John', licenseNumber: 'DL-123', phone: '+1-555-0101', email: 'john@test.com', costPerMile: 1.50 };
      const expected = { id: '1', ...dto, tenantId };
      prisma.driver.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(expected);
      expect(prisma.driver.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ tenantId }) }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated drivers', async () => {
      const drivers = [{ id: '1', tenantId }];
      prisma.driver.findMany.mockResolvedValue(drivers);

      const result = await service.findAll(tenantId, 1, 10);

      expect(result).toEqual(drivers);
      expect(prisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId }, skip: 0, take: 10 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a driver by id', async () => {
      const driver = { id: '1', tenantId };
      prisma.driver.findUnique.mockResolvedValue(driver);

      const result = await service.findOne(tenantId, '1');

      expect(result).toEqual(driver);
      expect(prisma.driver.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException for missing driver', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(prisma.driver.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.driver.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });

      await expect(service.findOne(tenantId, '1')).rejects.toThrow(NotFoundException);
      expect(prisma.driver.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update a driver', async () => {
      prisma.driver.findUnique.mockResolvedValue({ id: '1', tenantId });
      prisma.driver.update.mockResolvedValue({ id: '1', name: 'Jane' });

      const result = await service.update(tenantId, '1', { name: 'Jane' });

      expect(result.name).toBe('Jane');
      expect(prisma.driver.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });

    it('should throw NotFoundException for non-existent driver update', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.update(tenantId, 'bad', { name: 'X' })).rejects.toThrow(NotFoundException);
      expect(prisma.driver.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad' } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a driver', async () => {
      prisma.driver.findUnique.mockResolvedValue({ id: '1', tenantId });
      prisma.driver.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove(tenantId, '1');

      expect(result).toEqual({ id: '1' });
      expect(prisma.driver.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException for non-existent driver delete', async () => {
      prisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'bad')).rejects.toThrow(NotFoundException);
      expect(prisma.driver.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad' } }),
      );
    });
  });
});
