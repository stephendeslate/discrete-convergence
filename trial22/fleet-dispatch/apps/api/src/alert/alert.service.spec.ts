import { Test } from '@nestjs/testing';
import { AlertService } from './alert.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AlertService', () => {
  let service: AlertService;
  let prisma: { alert: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { alert: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [AlertService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(AlertService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('findAll returns paginated alerts', async () => {
    prisma.alert.findMany.mockResolvedValue([{ id: 'a1' }]);
    prisma.alert.count.mockResolvedValue(1);
    const result = await service.findAll('t1');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('findOne throws NotFoundException when not found', async () => {
    prisma.alert.findFirst.mockResolvedValue(null);
    await expect(service.findOne('a1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('markRead updates the alert', async () => {
    prisma.alert.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.alert.update.mockResolvedValue({ id: 'a1', read: true });
    const result = await service.markRead('a1', 't1');
    expect(prisma.alert.update).toHaveBeenCalledWith({ where: { id: 'a1' }, data: { read: true } });
    expect(result.read).toBe(true);
  });
});
