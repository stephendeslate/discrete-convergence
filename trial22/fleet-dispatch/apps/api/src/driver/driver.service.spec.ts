import { Test } from '@nestjs/testing';
import { DriverService } from './driver.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('DriverService', () => {
  let service: DriverService;
  let prisma: { driver: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { driver: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [DriverService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(DriverService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('findAll returns paginated data', async () => {
    prisma.driver.findMany.mockResolvedValue([{ id: '1' }]);
    prisma.driver.count.mockResolvedValue(1);
    const result = await service.findAll('t1');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('findOne throws NotFoundException when not found', async () => {
    prisma.driver.findFirst.mockResolvedValue(null);
    await expect(service.findOne('d1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('create delegates to prisma with tenantId', async () => {
    prisma.driver.create.mockResolvedValue({ id: 'd1' });
    await service.create({ name: 'John', licenseNumber: 'L123', phone: '555-0100' }, 't1');
    expect(prisma.driver.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ name: 'John', tenantId: 't1' }),
    }));
  });
});
