import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../infra/prisma.service';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: {
    route: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    routeStop: {
      create: jest.Mock;
      findFirst: jest.Mock;
      delete: jest.Mock;
    };
    setTenantContext: jest.Mock;
  };

  const companyId = 'comp-1';

  beforeEach(async () => {
    prisma = {
      route: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      routeStop: {
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  it('should create a route', async () => {
    prisma.route.create.mockResolvedValue({
      id: 'route-1',
      name: 'Morning Route',
      technicianId: 'tech-1',
      companyId,
    });

    const result = await service.create(companyId, {
      name: 'Morning Route',
      technicianId: 'tech-1',
    });

    expect(result.name).toBe('Morning Route');
    expect(prisma.setTenantContext).toHaveBeenCalledWith(companyId);
  });

  it('should throw 404 for non-existent route', async () => {
    prisma.route.findFirst.mockResolvedValue(null);

    await expect(service.findOne(companyId, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw 409 on optimistic locking conflict', async () => {
    prisma.route.findFirst.mockResolvedValue({
      id: 'route-1',
      name: 'Route',
      version: 1,
      companyId,
    });
    prisma.route.update.mockRejectedValue(new Error('Record not found'));

    await expect(
      service.update(companyId, 'route-1', { name: 'Updated' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw 409 when adding duplicate stop', async () => {
    prisma.route.findFirst.mockResolvedValue({
      id: 'route-1',
      companyId,
      stops: [],
    });
    prisma.routeStop.findFirst.mockResolvedValue({ id: 'stop-1' });

    await expect(
      service.addStop(companyId, 'route-1', 'wo-1', 1),
    ).rejects.toThrow(ConflictException);
  });
});
