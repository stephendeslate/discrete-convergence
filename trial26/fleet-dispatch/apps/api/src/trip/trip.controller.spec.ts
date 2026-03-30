// TRACED:TEST-TRIP-CTRL — Trip controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { TripController } from './trip.controller';
import { Request } from 'express';
import { TripService } from './trip.service';

describe('TripController', () => {
  let controller: TripController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    complete: jest.fn(),
  };

  const mockReq = {
    user: { userId: 'u1', tenantId: 't1', email: 'test@test.com' },
  } as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripController],
      providers: [{ provide: TripService, useValue: mockService }],
    }).compile();

    controller = module.get(TripController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service with tenant and pagination', async () => {
      mockService.findAll.mockResolvedValue({ data: [], total: 0 });
      const result = await controller.findAll(mockReq, { page: 1, pageSize: 10 });
      expect(mockService.findAll).toHaveBeenCalledWith('t1', { page: 1, pageSize: 10 });
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('findOne', () => {
    it('should call service with id and tenant', async () => {
      mockService.findOne.mockResolvedValue({ id: 'trip1' });
      const result = await controller.findOne('trip1', mockReq);
      expect(mockService.findOne).toHaveBeenCalledWith('trip1', 't1');
      expect(result.id).toBe('trip1');
    });
  });

  describe('create', () => {
    it('should call service with dto, tenant, and user', async () => {
      const dto = { dispatchId: 'd1', startLocation: 'A', endLocation: 'B', startTime: '2026-04-01T08:00:00Z' };
      mockService.create.mockResolvedValue({ id: 'trip1', ...dto });
      const result = await controller.create(dto, mockReq);
      expect(mockService.create).toHaveBeenCalledWith(dto, 't1', 'u1');
      expect(result.id).toBe('trip1');
    });
  });

  describe('complete', () => {
    it('should call service with id, distance, tenant, and user', async () => {
      mockService.complete.mockResolvedValue({ id: 'trip1', status: 'COMPLETED' });
      const result = await controller.complete('trip1', { distance: 42.5 }, mockReq);
      expect(mockService.complete).toHaveBeenCalledWith('trip1', 42.5, 't1', 'u1');
      expect(result.status).toBe('COMPLETED');
    });

    it('should handle complete without distance', async () => {
      mockService.complete.mockResolvedValue({ id: 'trip1', status: 'COMPLETED' });
      const result = await controller.complete('trip1', {}, mockReq);
      expect(mockService.complete).toHaveBeenCalledWith('trip1', undefined, 't1', 'u1');
      expect(result.status).toBe('COMPLETED');
    });
  });
});
