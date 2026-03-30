import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from './driver.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

const mockPrisma = {
  driver: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
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
    it('should create a driver with tenantId', async () => {
      const dto = { firstName: 'John', lastName: 'Doe', email: 'john@test.com', phone: '555-0100', licenseNumber: 'DL-001' };
      const created = { id: 'drv-1', ...dto, tenantId };
      mockPrisma.driver.create.mockResolvedValue(created);

      const result = await service.create(tenantId, dto as CreateDriverDto);

      expect(result).toEqual(created);
      expect(mockPrisma.driver.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ firstName: 'John', lastName: 'Doe', tenantId }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated drivers', async () => {
      const drivers = [{ id: 'drv-1', tenantId }];
      mockPrisma.driver.findMany.mockResolvedValue(drivers);
      mockPrisma.driver.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result).toEqual(expect.objectContaining({ data: drivers, total: 1, page: 1, pageSize: 10 }));
      expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId }, skip: 0, take: 10 }),
      );
      expect(mockPrisma.driver.count).toHaveBeenCalledWith({ where: { tenantId } });
    });
  });

  describe('findOne', () => {
    it('should return driver when found with matching tenantId', async () => {
      const driver = { id: 'drv-1', tenantId };
      mockPrisma.driver.findUnique.mockResolvedValue(driver);

      const result = await service.findOne(tenantId, 'drv-1');

      expect(result).toEqual(driver);
      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({ where: { id: 'drv-1' } });
    });

    it('should throw NotFoundException when driver not found', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'drv-999')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({ where: { id: 'drv-999' } });
    });
  });

  describe('remove', () => {
    it('should delete driver after verifying ownership', async () => {
      const driver = { id: 'drv-1', tenantId };
      mockPrisma.driver.findUnique.mockResolvedValue(driver);
      mockPrisma.driver.delete.mockResolvedValue(driver);

      const result = await service.remove(tenantId, 'drv-1');

      expect(result).toEqual(driver);
      expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({ where: { id: 'drv-1' } });
      expect(mockPrisma.driver.delete).toHaveBeenCalledWith({ where: { id: 'drv-1' } });
    });
  });
});
