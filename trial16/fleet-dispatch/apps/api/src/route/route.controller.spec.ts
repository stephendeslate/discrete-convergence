import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PaginatedQueryDto } from '../common/paginated-query';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  JwtPayload: {},
}));

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq = { user: { sub: 'u-1', email: 'a@b.com', role: 'admin', tenantId: 't-1' } } as unknown as Request;

describe('RouteController', () => {
  let controller: RouteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [{ provide: RouteService, useValue: mockService }],
    }).compile();
    controller = module.get<RouteController>(RouteController);
    jest.clearAllMocks();
  });

  it('should create route with tenantId from user', () => {
    const dto = { name: 'Route A', origin: 'A', destination: 'B' };
    mockService.create.mockResolvedValue({ id: 'r-1' });
    controller.create(mockReq, dto as CreateRouteDto);
    expect(mockService.create).toHaveBeenCalledWith('t-1', dto);
  });

  it('should findAll with pagination', () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    controller.findAll(mockReq, { page: 1, pageSize: 10 } as PaginatedQueryDto);
    expect(mockService.findAll).toHaveBeenCalledWith('t-1', 1, 10);
  });

  it('should findOne by id', () => {
    mockService.findOne.mockResolvedValue({ id: 'r-1' });
    controller.findOne(mockReq, 'r-1');
    expect(mockService.findOne).toHaveBeenCalledWith('t-1', 'r-1');
  });

  it('should update route', () => {
    const dto = { name: 'Updated' };
    mockService.update.mockResolvedValue({ id: 'r-1' });
    controller.update(mockReq, 'r-1', dto as UpdateRouteDto);
    expect(mockService.update).toHaveBeenCalledWith('t-1', 'r-1', dto);
  });

  it('should remove route', () => {
    mockService.remove.mockResolvedValue({ id: 'r-1' });
    controller.remove(mockReq, 'r-1');
    expect(mockService.remove).toHaveBeenCalledWith('t-1', 'r-1');
  });
});
