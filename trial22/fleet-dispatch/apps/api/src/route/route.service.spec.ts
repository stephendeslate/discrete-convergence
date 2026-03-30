import { Test } from '@nestjs/testing';
import { RouteService } from './route.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: { route: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { route: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [RouteService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(RouteService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('findAll returns paginated data with tenant scope', async () => {
    prisma.route.findMany.mockResolvedValue([{ id: 'r1' }]);
    prisma.route.count.mockResolvedValue(1);
    const result = await service.findAll('t1');
    expect(result.total).toBe(1);
    expect(prisma.route.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 't1' } }));
  });

  it('findOne throws NotFoundException when not found', async () => {
    prisma.route.findFirst.mockResolvedValue(null);
    await expect(service.findOne('r1', 't1')).rejects.toThrow(NotFoundException);
  });
});
