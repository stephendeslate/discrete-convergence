// TRACED:API-ROUTE-SERVICE-SPEC
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  route: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  setCompanyId: jest.fn(),
};

describe('RouteService', () => {
  let service: RouteService;
  const companyId = 'c1';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(RouteService);
  });

  describe('findAll', () => {
    it('returns paginated routes', async () => {
      mockPrisma.route.findMany.mockResolvedValue([{ id: 'r1' }]);
      mockPrisma.route.count.mockResolvedValue(1);

      const result = await service.findAll(companyId, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('returns a route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'r1', companyId });
      const result = await service.findOne('r1', companyId);
      expect(result.id).toBe('r1');
    });

    it('throws NotFoundException for missing route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);
      await expect(service.findOne('r1', companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a route', async () => {
      const dto = { name: 'Route A', origin: 'A', destination: 'B', distanceKm: 100, estimatedMinutes: 60 };
      mockPrisma.route.create.mockResolvedValue({ id: 'r1', ...dto, companyId });

      const result = await service.create(dto, companyId);
      expect(result.name).toBe('Route A');
    });
  });

  describe('update', () => {
    it('updates a route after verifying existence', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'r1', companyId });
      mockPrisma.route.update.mockResolvedValue({ id: 'r1', name: 'Route B' });

      const result = await service.update('r1', { name: 'Route B' } as never, companyId);
      expect(result.name).toBe('Route B');
    });

    it('throws NotFoundException when updating non-existent route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);
      await expect(service.update('r1', {} as never, companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('hard deletes a route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue({ id: 'r1', companyId });
      mockPrisma.route.delete.mockResolvedValue({ id: 'r1' });

      const result = await service.remove('r1', companyId);
      expect(result.id).toBe('r1');
    });

    it('throws NotFoundException when removing non-existent route', async () => {
      mockPrisma.route.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', companyId)).rejects.toThrow(NotFoundException);
    });
  });
});
