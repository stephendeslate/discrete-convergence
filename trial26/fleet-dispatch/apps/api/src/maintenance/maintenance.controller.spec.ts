// TRACED:TEST-MAINTENANCE-CTRL — Maintenance controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceController } from './maintenance.controller';
import { Request } from 'express';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceTypeEnum } from './dto/create-maintenance.dto';

describe('MaintenanceController', () => {
  let controller: MaintenanceController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    complete: jest.fn(),
  };

  const mockReq = {
    user: { userId: 'u1', tenantId: 't1', email: 'test@test.com' },
  } as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [{ provide: MaintenanceService, useValue: mockService }],
    }).compile();

    controller = module.get(MaintenanceController);
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
      mockService.findOne.mockResolvedValue({ id: 'm1' });
      const result = await controller.findOne('m1', mockReq);
      expect(mockService.findOne).toHaveBeenCalledWith('m1', 't1');
      expect(result.id).toBe('m1');
    });
  });

  describe('create', () => {
    it('should call service with dto, tenant, and user', async () => {
      const dto = { vehicleId: 'v1', type: MaintenanceTypeEnum.SCHEDULED, description: 'Oil change', scheduledDate: '2026-04-01' };
      mockService.create.mockResolvedValue({ id: 'm1', ...dto });
      const result = await controller.create(dto, mockReq);
      expect(mockService.create).toHaveBeenCalledWith(dto, 't1', 'u1');
      expect(result.id).toBe('m1');
    });
  });

  describe('update', () => {
    it('should call service with id, dto, tenant, and user', async () => {
      const dto = { description: 'Updated' };
      mockService.update.mockResolvedValue({ id: 'm1', description: 'Updated' });
      const result = await controller.update('m1', dto, mockReq);
      expect(mockService.update).toHaveBeenCalledWith('m1', dto, 't1', 'u1');
      expect(result.description).toBe('Updated');
    });
  });

  describe('complete', () => {
    it('should call service with id, tenant, and user', async () => {
      mockService.complete.mockResolvedValue({ id: 'm1', status: 'COMPLETED' });
      const result = await controller.complete('m1', mockReq);
      expect(mockService.complete).toHaveBeenCalledWith('m1', 't1', 'u1');
      expect(result.status).toBe('COMPLETED');
    });
  });
});
