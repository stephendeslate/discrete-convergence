import { Test } from '@nestjs/testing';
import { MaintenanceService } from './maintenance.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let prisma: { maintenanceRecord: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock; create: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { maintenanceRecord: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [MaintenanceService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(MaintenanceService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('findAll returns paginated records', async () => {
    prisma.maintenanceRecord.findMany.mockResolvedValue([{ id: 'm1' }]);
    prisma.maintenanceRecord.count.mockResolvedValue(1);
    const result = await service.findAll('t1');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('findOne throws NotFoundException when not found', async () => {
    prisma.maintenanceRecord.findFirst.mockResolvedValue(null);
    await expect(service.findOne('m1', 't1')).rejects.toThrow(NotFoundException);
  });
});
