import { Test, TestingModule } from '@nestjs/testing';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { RequestWithUser } from '../common/auth-utils';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getWidgetData: jest.fn(),
};

const mockReq = {
  user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'user' },
} as unknown as RequestWithUser;

describe('WidgetController', () => {
  let controller: WidgetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WidgetController],
      providers: [{ provide: WidgetService, useValue: mockService }],
    }).compile();

    controller = module.get<WidgetController>(WidgetController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(WidgetController);
  });

  describe('findAll', () => {
    it('should delegate to service with tenantId and pagination', async () => {
      const expected = { data: [], total: 0, page: 1, limit: 20 };
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockReq, { page: 1, limit: 20 });

      expect(result).toEqual(expected);
      expect(mockService.findAll).toHaveBeenCalledWith('t1', 1, 20);
    });
  });

  describe('findOne', () => {
    it('should delegate to service with id and tenantId', async () => {
      const widget = { id: '1', name: 'Chart' };
      mockService.findOne.mockResolvedValue(widget);

      const result = await controller.findOne(mockReq, '1');

      expect(result).toEqual(widget);
      expect(mockService.findOne).toHaveBeenCalledWith('1', 't1');
    });
  });

  describe('getWidgetData', () => {
    it('should delegate to service with id and tenantId', async () => {
      const data = { widgetId: '1', data: [], fetchedAt: '2024-01-01' };
      mockService.getWidgetData.mockResolvedValue(data);

      const result = await controller.getWidgetData(mockReq, '1');

      expect(result).toEqual(data);
      expect(mockService.getWidgetData).toHaveBeenCalledWith('1', 't1');
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
