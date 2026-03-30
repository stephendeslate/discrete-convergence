import { Test } from '@nestjs/testing';
import { FuelService } from './fuel.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FuelService', () => {
  let service: FuelService;
  let prisma: { fuelLog: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock; create: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { fuelLog: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [FuelService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(FuelService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('findAll returns paginated fuel logs', async () => {
    prisma.fuelLog.findMany.mockResolvedValue([{ id: 'f1' }]);
    prisma.fuelLog.count.mockResolvedValue(1);
    const result = await service.findAll('t1');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('findOne throws NotFoundException when not found', async () => {
    prisma.fuelLog.findFirst.mockResolvedValue(null);
    await expect(service.findOne('f1', 't1')).rejects.toThrow(NotFoundException);
  });
});
