import { Test } from '@nestjs/testing';
import { GeofenceService } from './geofence.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GeofenceService', () => {
  let service: GeofenceService;
  let prisma: { geofence: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock; create: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = { geofence: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [GeofenceService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(GeofenceService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('findAll returns paginated geofences', async () => {
    prisma.geofence.findMany.mockResolvedValue([{ id: 'g1' }]);
    prisma.geofence.count.mockResolvedValue(1);
    const result = await service.findAll('t1');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('findOne throws NotFoundException when not found', async () => {
    prisma.geofence.findFirst.mockResolvedValue(null);
    await expect(service.findOne('g1', 't1')).rejects.toThrow(NotFoundException);
  });
});
