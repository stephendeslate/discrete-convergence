import { Test } from '@nestjs/testing';
import { StopService } from './stop.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('StopService', () => {
  let service: StopService;
  let prisma: { stop: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock; create: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { stop: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [StopService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(StopService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('findAll returns paginated stops', async () => {
    prisma.stop.findMany.mockResolvedValue([{ id: 's1' }]);
    prisma.stop.count.mockResolvedValue(1);
    const result = await service.findAll('t1');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('findOne throws NotFoundException when not found', async () => {
    prisma.stop.findFirst.mockResolvedValue(null);
    await expect(service.findOne('s1', 't1')).rejects.toThrow(NotFoundException);
  });
});
