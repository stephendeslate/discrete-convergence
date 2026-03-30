import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RequestWithUser } from '../common/auth-utils';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  publish: jest.fn(),
  archive: jest.fn(),
};

const mockReq = {
  user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'user' },
} as unknown as RequestWithUser;

const mockRes = {
  setHeader: jest.fn(),
} as unknown as import('express').Response;

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockService }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(DashboardController);
  });

  describe('findAll', () => {
    it('should delegate to service with tenantId and pagination', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 20 };
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockReq, { page: 1, limit: 20 }, mockRes);

      expect(result).toEqual(expected);
      expect(mockService.findAll).toHaveBeenCalledWith('t1', 1, 20);
    });
  });

  describe('findOne', () => {
    it('should delegate to service with id and tenantId', async () => {
      const dashboard = { id: '1', name: 'Test' };
      mockService.findOne.mockResolvedValue(dashboard);

      const result = await controller.findOne(mockReq, '1');

      expect(result).toEqual(dashboard);
      expect(mockService.findOne).toHaveBeenCalledWith('1', 't1');
    });
  });

  describe('create', () => {
    it('should delegate to service with tenantId and dto', async () => {
      const dto = { name: 'New' };
      const created = { id: '1', ...dto };
      mockService.create.mockResolvedValue(created);

      const result = await controller.create(mockReq, dto);

      expect(result).toEqual(created);
      expect(mockService.create).toHaveBeenCalledWith('t1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to service with id and tenantId', async () => {
      mockService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove(mockReq, '1');

      expect(result).toEqual({ id: '1' });
      expect(mockService.remove).toHaveBeenCalledWith('1', 't1');
    });
  });
});
