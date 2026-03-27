// TRACED: FD-API-003 — Driver service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DriverService } from './driver.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  driver: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DriverService', () => {
  let service: DriverService;
  const tenantId = 'tenant-1';

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
    const dto = { name: 'John', email: 'john@example.com', licenseNumber: 'DL-001' };

    it('should create a driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);
      mockPrisma.driver.create.mockResolvedValue({ id: 'd1', ...dto, tenantId });

      const result = await service.create(tenantId, dto);

      expect(result.name).toBe('John');
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockPrisma.driver.findFirst.mockResolvedValueOnce({ id: 'existing' });

      await expect(service.create(tenantId, dto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate license number', async () => {
      mockPrisma.driver.findFirst
        .mockResolvedValueOnce(null) // email check passes
        .mockResolvedValueOnce({ id: 'existing' }); // license check fails

      await expect(service.create(tenantId, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', tenantId });

      const result = await service.findOne(tenantId, 'd1');

      expect(result.id).toBe('d1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([{ id: 'd1' }]);
      mockPrisma.driver.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result.data).toHaveLength(1);
    });

    it('should return empty data when no drivers exist', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([]);
      mockPrisma.driver.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId);

      expect(result.data).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update a driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', tenantId });
      mockPrisma.driver.update.mockResolvedValue({ id: 'd1', name: 'Updated' });

      const result = await service.update(tenantId, 'd1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw conflict error for duplicate email on update', async () => {
      mockPrisma.driver.findFirst
        .mockResolvedValueOnce({ id: 'd1', tenantId })
        .mockResolvedValueOnce({ id: 'd2', email: 'dup@test.com' });

      await expect(
        service.update(tenantId, 'd1', { email: 'dup@test.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw conflict error for duplicate license number on update', async () => {
      mockPrisma.driver.findFirst
        .mockResolvedValueOnce({ id: 'd1', tenantId }) // findOne check
        .mockResolvedValueOnce({ id: 'd2', licenseNumber: 'DUP-LIC' }); // license check

      await expect(
        service.update(tenantId, 'd1', { licenseNumber: 'DUP-LIC' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', tenantId });
      mockPrisma.driver.delete.mockResolvedValue({ id: 'd1' });

      const result = await service.remove(tenantId, 'd1');

      expect(result.id).toBe('d1');
    });

    it('should throw not found error when removing non-existent driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
