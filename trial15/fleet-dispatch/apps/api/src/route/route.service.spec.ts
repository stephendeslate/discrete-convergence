import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

const mockPrisma = {
  route: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('RouteService', () => {
  let service: RouteService;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<RouteService>(RouteService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a route with tenantId', async () => {
      const dto = { name: 'Route A', description: 'Main route', origin: 'City A', destination: 'City B' };
      const created = { id: 'r-1', ...dto, tenantId };
      mockPrisma.route.create.mockResolvedValue(created);

      const result = await service.create(tenantId, dto as CreateRouteDto);

      expect(result).toEqual(created);
      expect(mockPrisma.route.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Route A', origin: 'City A', destination: 'City B', tenantId }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated routes with dispatches included', async () => {
      const routes = [{ id: 'r-1', tenantId, dispatches: [] }];
      mockPrisma.route.findMany.mockResolvedValue(routes);
      mockPrisma.route.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result).toEqual(expect.objectContaining({ data: routes, total: 1, page: 1, pageSize: 10 }));
      expect(mockPrisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
          include: { dispatches: true },
          skip: 0,
          take: 10,
        }),
      );
      expect(mockPrisma.route.count).toHaveBeenCalledWith({ where: { tenantId } });
    });
  });

  describe('findOne', () => {
    it('should return route with dispatches when found', async () => {
      const route = { id: 'r-1', tenantId, dispatches: [] };
      mockPrisma.route.findUnique.mockResolvedValue(route);

      const result = await service.findOne(tenantId, 'r-1');

      expect(result).toEqual(route);
      expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({
        where: { id: 'r-1' },
        include: { dispatches: true },
      });
    });

    it('should throw NotFoundException when route not found', async () => {
      mockPrisma.route.findUnique.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'r-999')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({
        where: { id: 'r-999' },
        include: { dispatches: true },
      });
    });
  });

  describe('remove', () => {
    it('should delete route after verifying ownership', async () => {
      const route = { id: 'r-1', tenantId, dispatches: [] };
      mockPrisma.route.findUnique.mockResolvedValue(route);
      mockPrisma.route.delete.mockResolvedValue(route);

      const result = await service.remove(tenantId, 'r-1');

      expect(result).toEqual(route);
      expect(mockPrisma.route.findUnique).toHaveBeenCalledWith({
        where: { id: 'r-1' },
        include: { dispatches: true },
      });
      expect(mockPrisma.route.delete).toHaveBeenCalledWith({ where: { id: 'r-1' } });
    });
  });
});
