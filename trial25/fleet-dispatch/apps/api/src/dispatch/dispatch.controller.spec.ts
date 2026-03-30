// TRACED:TEST-DISPATCH-CTRL — Dispatch controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { DispatchController } from './dispatch.controller';
import { Request } from 'express';
import { DispatchService } from './dispatch.service';

describe('DispatchController', () => {
  let controller: DispatchController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    dispatch: jest.fn(),
    assign: jest.fn(),
    complete: jest.fn(),
    cancel: jest.fn(),
  };

  const mockReq = {
    user: { userId: 'u1', tenantId: 't1', email: 'test@test.com' },
  } as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispatchController],
      providers: [{ provide: DispatchService, useValue: mockService }],
    }).compile();

    controller = module.get(DispatchController);
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
      mockService.findOne.mockResolvedValue({ id: 'd1', status: 'PENDING' });
      const result = await controller.findOne('d1', mockReq);
      expect(mockService.findOne).toHaveBeenCalledWith('d1', 't1');
      expect(result.id).toBe('d1');
    });
  });

  describe('create', () => {
    it('should call service dispatch with dto, tenant, and user', async () => {
      const dto = { vehicleId: 'v1', driverId: 'dr1', routeId: 'r1', scheduledAt: '2026-04-01T08:00:00Z' };
      mockService.dispatch.mockResolvedValue({ id: 'd1', status: 'PENDING' });
      const result = await controller.create(dto, mockReq);
      expect(mockService.dispatch).toHaveBeenCalledWith(dto, 't1', 'u1');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('assign', () => {
    it('should call service assign with id, tenant, and user', async () => {
      mockService.assign.mockResolvedValue({ id: 'd1', status: 'ASSIGNED' });
      const result = await controller.assign('d1', mockReq);
      expect(mockService.assign).toHaveBeenCalledWith('d1', 't1', 'u1');
      expect(result.status).toBe('ASSIGNED');
    });
  });

  describe('complete', () => {
    it('should call service complete with id, tenant, and user', async () => {
      mockService.complete.mockResolvedValue({ id: 'd1', status: 'COMPLETED' });
      const result = await controller.complete('d1', mockReq);
      expect(mockService.complete).toHaveBeenCalledWith('d1', 't1', 'u1');
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('cancel', () => {
    it('should call service cancel with id, tenant, and user', async () => {
      mockService.cancel.mockResolvedValue({ id: 'd1', status: 'CANCELLED' });
      const result = await controller.cancel('d1', mockReq);
      expect(mockService.cancel).toHaveBeenCalledWith('d1', 't1', 'u1');
      expect(result.status).toBe('CANCELLED');
    });
  });
});
