// TRACED:TEST-DRIVER-CTRL — Driver controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { DriverController } from './driver.controller';
import { Request } from 'express';
import { DriverService } from './driver.service';

describe('DriverController', () => {
  let controller: DriverController;
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
      controllers: [DriverController],
      providers: [{ provide: DriverService, useValue: mockService }],
    }).compile();

    controller = module.get(DriverController);
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
      mockService.findOne.mockResolvedValue({ id: 'dr1', name: 'John' });
      const result = await controller.findOne('dr1', mockReq);
      expect(mockService.findOne).toHaveBeenCalledWith('dr1', 't1');
      expect(result.id).toBe('dr1');
    });
  });

  describe('create', () => {
    it('should call service with dto, tenant, and user', async () => {
      const dto = { name: 'John', email: 'john@test.com', phone: '555-1234', licenseNumber: 'DL-001' };
      mockService.create.mockResolvedValue({ id: 'dr1', ...dto });
      const result = await controller.create(dto, mockReq);
      expect(mockService.create).toHaveBeenCalledWith(dto, 't1', 'u1');
      expect(result.id).toBe('dr1');
    });
  });

  describe('update', () => {
    it('should call service with id, dto, tenant, and user', async () => {
      const dto = { name: 'Jane' };
      mockService.update.mockResolvedValue({ id: 'dr1', name: 'Jane' });
      const result = await controller.update('dr1', dto, mockReq);
      expect(mockService.update).toHaveBeenCalledWith('dr1', dto, 't1', 'u1');
      expect(result.name).toBe('Jane');
    });
  });

  describe('remove', () => {
    it('should call service with id, tenant, and user', async () => {
      mockService.remove.mockResolvedValue({ deleted: true });
      const result = await controller.remove('dr1', mockReq);
      expect(mockService.remove).toHaveBeenCalledWith('dr1', 't1', 'u1');
      expect(result.deleted).toBe(true);
    });
  });
});
