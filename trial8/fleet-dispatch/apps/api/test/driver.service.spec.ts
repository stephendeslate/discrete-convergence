import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from '../src/driver/driver.service';
import { PrismaService } from '../src/infra/prisma.service';
import { LoggerService } from '../src/infra/logger.service';

describe('DriverService', () => {
  let service: DriverService;
  let prisma: {
    driver: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      driver: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: prisma },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn() } },
      ],
    }).compile();

    service = module.get<DriverService>(DriverService);
  });

  // TRACED: FD-DRV-001
  it('should return paginated drivers', async () => {
    prisma.driver.findMany.mockResolvedValue([{ id: 'd1', name: 'John' }]);
    prisma.driver.count.mockResolvedValue(1);

    const result = await service.findAll('t1', { page: 1, pageSize: 20 });
    expect(result.data).toHaveLength(1);
    expect(prisma.driver.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1' } }),
    );
  });

  // TRACED: FD-DRV-002
  it('should find a driver by id and tenantId', async () => {
    prisma.driver.findFirst.mockResolvedValue({ id: 'd1', name: 'John', tenantId: 't1' });

    const result = await service.findOne('d1', 't1');
    expect(result.name).toBe('John');
    expect(prisma.driver.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'd1', tenantId: 't1' } }),
    );
  });

  // TRACED: FD-DRV-003
  it('should throw NotFoundException for non-existent driver', async () => {
    prisma.driver.findFirst.mockResolvedValue(null);

    await expect(service.findOne('d-none', 't1')).rejects.toThrow(NotFoundException);
    expect(prisma.driver.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'd-none', tenantId: 't1' } }),
    );
  });

  // TRACED: FD-DRV-004
  it('should create a driver', async () => {
    prisma.driver.create.mockResolvedValue({
      id: 'd2',
      licenseNumber: 'DL-100',
      name: 'Jane',
      certifications: ['CDL-A'],
      tenantId: 't1',
    });

    const result = await service.create({ licenseNumber: 'DL-100', name: 'Jane', certifications: ['CDL-A'] }, 't1');
    expect(result.licenseNumber).toBe('DL-100');
    expect(prisma.driver.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ licenseNumber: 'DL-100', tenantId: 't1' }) }),
    );
  });

  // TRACED: FD-DRV-005
  it('should throw NotFoundException when updating non-existent driver', async () => {
    prisma.driver.findFirst.mockResolvedValue(null);

    await expect(service.update('d-none', { name: 'Updated' }, 't1')).rejects.toThrow(NotFoundException);
    expect(prisma.driver.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'd-none', tenantId: 't1' } }),
    );
  });

  // TRACED: FD-DRV-006
  it('should delete a driver', async () => {
    prisma.driver.findFirst.mockResolvedValue({ id: 'd1', tenantId: 't1' });
    prisma.driver.delete.mockResolvedValue({ id: 'd1' });

    const result = await service.delete('d1', 't1');
    expect(result.deleted).toBe(true);
    expect(prisma.driver.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'd1', tenantId: 't1' } }),
    );
  });

  // TRACED: FD-DRV-007
  it('should throw NotFoundException when deleting non-existent driver', async () => {
    prisma.driver.findFirst.mockResolvedValue(null);

    await expect(service.delete('d-none', 't1')).rejects.toThrow(NotFoundException);
    expect(prisma.driver.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'd-none', tenantId: 't1' } }),
    );
  });
});
