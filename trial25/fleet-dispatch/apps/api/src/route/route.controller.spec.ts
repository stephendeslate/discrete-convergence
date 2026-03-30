// TRACED:TEST-ROUTE-CTRL — Route controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { RouteController } from './route.controller';
import { Request } from 'express';
import { RouteService } from './route.service';

describe('RouteController', () => {
  let controller: RouteController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockReq = {
    user: { userId: 'u1', tenantId: 't1', email: 'test@test.com' },
  } as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [{ provide: RouteService, useValue: mockService }],
    }).compile();

    controller = module.get(RouteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service with tenant and pagination', async () => {
      mockService.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });
      const result = await controller.findAll(mockReq, { page: 1, pageSize: 10 });
      expect(mockService.findAll).toHaveBeenCalledWith('t1', { page: 1, pageSize: 10 });
      expect(result.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should call service with id and tenant', async () => {
      mockService.findOne.mockResolvedValue({ id: 'r1', name: 'Route A' });
      const result = await controller.findOne('r1', mockReq);
      expect(mockService.findOne).toHaveBeenCalledWith('r1', 't1');
      expect(result.id).toBe('r1');
    });
  });

  describe('create', () => {
    it('should call service with dto, tenant, and user', async () => {
      const dto = { name: 'Route A', origin: 'A', destination: 'B', distance: 50, estimatedDuration: 60 };
      mockService.create.mockResolvedValue({ id: 'r1', ...dto });
      const result = await controller.create(dto, mockReq);
      expect(mockService.create).toHaveBeenCalledWith(dto, 't1', 'u1');
      expect(result.id).toBe('r1');
    });
  });

  describe('update', () => {
    it('should call service with id, dto, tenant, and user', async () => {
      const dto = { name: 'Route B' };
      mockService.update.mockResolvedValue({ id: 'r1', name: 'Route B' });
      const result = await controller.update('r1', dto, mockReq);
      expect(mockService.update).toHaveBeenCalledWith('r1', dto, 't1', 'u1');
      expect(result.name).toBe('Route B');
    });
  });

  describe('remove', () => {
    it('should call service with id, tenant, and user', async () => {
      mockService.remove.mockResolvedValue({ deleted: true });
      const result = await controller.remove('r1', mockReq);
      expect(mockService.remove).toHaveBeenCalledWith('r1', 't1', 'u1');
      expect(result.deleted).toBe(true);
    });
  });
});
