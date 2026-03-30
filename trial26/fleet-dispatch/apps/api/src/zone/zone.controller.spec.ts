// TRACED:TEST-ZONE-CTRL — Zone controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { ZoneController } from './zone.controller';
import { Request } from 'express';
import { ZoneService } from './zone.service';

describe('ZoneController', () => {
  let controller: ZoneController;
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
      controllers: [ZoneController],
      providers: [{ provide: ZoneService, useValue: mockService }],
    }).compile();

    controller = module.get(ZoneController);
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
      mockService.findOne.mockResolvedValue({ id: 'z1', name: 'Zone A' });
      const result = await controller.findOne('z1', mockReq);
      expect(mockService.findOne).toHaveBeenCalledWith('z1', 't1');
      expect(result.id).toBe('z1');
    });
  });

  describe('create', () => {
    it('should call service with dto, tenant, and user', async () => {
      const dto = { name: 'Zone A', boundaries: { type: 'Polygon', coordinates: [] } };
      mockService.create.mockResolvedValue({ id: 'z1', ...dto });
      const result = await controller.create(dto, mockReq);
      expect(mockService.create).toHaveBeenCalledWith(dto, 't1', 'u1');
      expect(result.id).toBe('z1');
    });
  });

  describe('update', () => {
    it('should call service with id, dto, tenant, and user', async () => {
      const dto = { name: 'Zone B' };
      mockService.update.mockResolvedValue({ id: 'z1', name: 'Zone B' });
      const result = await controller.update('z1', dto, mockReq);
      expect(mockService.update).toHaveBeenCalledWith('z1', dto, 't1', 'u1');
      expect(result.name).toBe('Zone B');
    });
  });

  describe('remove', () => {
    it('should call service with id, tenant, and user', async () => {
      mockService.remove.mockResolvedValue({ deleted: true });
      const result = await controller.remove('z1', mockReq);
      expect(mockService.remove).toHaveBeenCalledWith('z1', 't1', 'u1');
      expect(result.deleted).toBe(true);
    });
  });
});
