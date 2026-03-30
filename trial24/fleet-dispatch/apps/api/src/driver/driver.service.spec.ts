// TRACED:API-DRIVER-SERVICE-SPEC
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from './driver.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  driver: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  setCompanyId: jest.fn(),
};

describe('DriverService', () => {
  let service: DriverService;
  const companyId = 'c1';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(DriverService);
  });

  describe('findAll', () => {
    it('returns paginated drivers', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([{ id: 'd1' }]);
      mockPrisma.driver.count.mockResolvedValue(1);

      const result = await service.findAll(companyId, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('returns a driver when found', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', companyId });
      const result = await service.findOne('d1', companyId);
      expect(result.id).toBe('d1');
      expect(mockPrisma.setCompanyId).toHaveBeenCalledWith(companyId);
    });

    it('throws NotFoundException for missing driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);
      await expect(service.findOne('d1', companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates a driver after verifying existence', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', companyId });
      mockPrisma.driver.update.mockResolvedValue({ id: 'd1', name: 'Jane' });

      const result = await service.update('d1', { name: 'Jane' } as never, companyId);
      expect(result.name).toBe('Jane');
    });

    it('throws NotFoundException when updating non-existent driver', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue(null);
      await expect(service.update('d1', {} as never, companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a driver with companyId', async () => {
      const dto = { name: 'John', email: 'john@test.com', licenseNumber: 'DL-1' };
      mockPrisma.driver.create.mockResolvedValue({ id: 'd1', ...dto, companyId });

      const result = await service.create(dto, companyId);
      expect(result.name).toBe('John');
    });
  });

  describe('remove', () => {
    it('sets driver status to OFF_DUTY', async () => {
      mockPrisma.driver.findFirst.mockResolvedValue({ id: 'd1', companyId });
      mockPrisma.driver.update.mockResolvedValue({ id: 'd1', status: 'OFF_DUTY' });

      const result = await service.remove('d1', companyId);
      expect(result.status).toBe('OFF_DUTY');
    });
  });
});
