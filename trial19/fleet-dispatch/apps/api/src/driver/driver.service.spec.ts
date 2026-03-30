import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from './driver.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  driver: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DriverService', () => {
  let service: DriverService;

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

  describe('findAll', () => {
    it('should return paginated drivers for tenant', async () => {
      const mockDrivers = [{ id: 'd-1', tenantId: 'tenant-1', name: 'John' }];
      mockPrisma.driver.findMany.mockResolvedValue(mockDrivers);
      mockPrisma.driver.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(mockPrisma.driver.count).toHaveBeenCalledWith({ where: { tenantId: 'tenant-1' } });
      expect(result.data).toEqual(mockDrivers);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a driver by id and tenant', async () => {
      const mockDriver = { id: 'd-1', tenantId: 'tenant-1', name: 'John' };
      mockPrisma.driver.findUnique.mockResolvedValue(mockDriver);

      const result = await service.findOne('d-1', 'tenant-1');

      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'd-1' },
        include: { dispatches: true },
      });
      expect(result.name).toBe('John');
    });

    it('should throw NotFoundException when driver not found', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.findOne('d-missing', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'd-missing' },
        include: { dispatches: true },
      });
    });

    it('should throw NotFoundException when driver belongs to different tenant', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ id: 'd-1', tenantId: 'other-tenant' });

      await expect(service.findOne('d-1', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 'd-1' },
        include: { dispatches: true },
      });
    });
  });

  describe('create', () => {
    it('should create a driver with tenant scope', async () => {
      const dto = { name: 'Jane', email: 'jane@test.com', licenseNumber: 'DL-111', status: 'AVAILABLE' };
      mockPrisma.driver.create.mockResolvedValue({ id: 'd-new', ...dto, tenantId: 'tenant-1' });

      const result = await service.create('tenant-1', dto);

      expect(mockPrisma.driver.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId: 'tenant-1', name: 'Jane' }),
      });
      expect(result.id).toBe('d-new');
    });
  });

  describe('update', () => {
    it('should update an existing driver', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ id: 'd-1', tenantId: 'tenant-1' });
      mockPrisma.driver.update.mockResolvedValue({ id: 'd-1', name: 'Updated' });

      const result = await service.update('d-1', 'tenant-1', { name: 'Updated' });

      expect(mockPrisma.driver.update).toHaveBeenCalledWith({
        where: { id: 'd-1' },
        data: expect.objectContaining({ name: 'Updated' }),
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a driver', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ id: 'd-1', tenantId: 'tenant-1' });
      mockPrisma.driver.delete.mockResolvedValue({ id: 'd-1' });

      const result = await service.remove('d-1', 'tenant-1');

      expect(mockPrisma.driver.delete).toHaveBeenCalledWith({ where: { id: 'd-1' } });
      expect(result.id).toBe('d-1');
    });
  });
});
