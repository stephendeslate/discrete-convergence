// TRACED:TEST-VEHICLE-CTRL — Vehicle controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { Request } from 'express';
import { VehicleService } from './vehicle.service';
import { VehicleTypeEnum } from './dto/create-vehicle.dto';

describe('VehicleController', () => {
  let controller: VehicleController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
  };

  const mockReq = {
    user: { userId: 'u1', tenantId: 't1', email: 'test@test.com' },
  } as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [{ provide: VehicleService, useValue: mockService }],
    }).compile();

    controller = module.get(VehicleController);
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
      mockService.findOne.mockResolvedValue({ id: 'v1', make: 'Toyota' });
      const result = await controller.findOne({ id: 'v1' }, mockReq);
      expect(mockService.findOne).toHaveBeenCalledWith('v1', 't1');
      expect(result.id).toBe('v1');
    });
  });

  describe('create', () => {
    it('should call service with dto, tenant, and user', async () => {
      const dto = { name: 'Truck 1', plateNumber: 'ABC-123', type: VehicleTypeEnum.TRUCK, capacity: 10 };
      mockService.create.mockResolvedValue({ id: 'v1', ...dto });
      const result = await controller.create(dto, mockReq);
      expect(mockService.create).toHaveBeenCalledWith(dto, 't1', 'u1');
      expect(result.id).toBe('v1');
    });
  });

  describe('update', () => {
    it('should call service with id, dto, tenant, and user', async () => {
      const dto = { name: 'Truck 2' };
      mockService.update.mockResolvedValue({ id: 'v1', name: 'Truck 2' });
      const result = await controller.update({ id: 'v1' }, dto, mockReq);
      expect(mockService.update).toHaveBeenCalledWith('v1', dto, 't1', 'u1');
      expect(result.name).toBe('Truck 2');
    });
  });

  describe('remove', () => {
    it('should call service with id, tenant, and user', async () => {
      mockService.remove.mockResolvedValue({ deleted: true });
      const result = await controller.remove({ id: 'v1' }, mockReq);
      expect(mockService.remove).toHaveBeenCalledWith('v1', 't1', 'u1');
      expect(result.deleted).toBe(true);
    });
  });

  describe('activate', () => {
    it('should call service activate with id, tenant, and user', async () => {
      mockService.activate.mockResolvedValue({ id: 'v1', status: 'ACTIVE' });
      const result = await controller.activate({ id: 'v1' }, mockReq);
      expect(mockService.activate).toHaveBeenCalledWith('v1', 't1', 'u1');
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('deactivate', () => {
    it('should call service deactivate with id, tenant, and user', async () => {
      mockService.deactivate.mockResolvedValue({ id: 'v1', status: 'INACTIVE' });
      const result = await controller.deactivate({ id: 'v1' }, mockReq);
      expect(mockService.deactivate).toHaveBeenCalledWith('v1', 't1', 'u1');
      expect(result.status).toBe('INACTIVE');
    });
  });
});
