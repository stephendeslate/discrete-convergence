import { Test } from '@nestjs/testing';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { RequestWithUser } from '../common/request-with-user';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockReq = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } } as RequestWithUser;

describe('WidgetController', () => {
  let controller: WidgetController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WidgetController],
      providers: [{ provide: WidgetService, useValue: mockService }],
    }).compile();
    controller = module.get(WidgetController);
    jest.clearAllMocks();
  });

  it('should call findAll with tenant id', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll(mockReq, {});
    expect(mockService.findAll).toHaveBeenCalledWith('t1', undefined, undefined);
    expect(result).toHaveProperty('total');
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1', mockReq);
    expect(mockService.findOne).toHaveBeenCalledWith('1', 't1');
    expect(result.id).toBe('1');
  });

  it('should call create', async () => {
    const dto = { title: 'W', type: 'LINE_CHART', config: '{}', dashboardId: 'd1', dataSourceId: 'ds1' };
    mockService.create.mockResolvedValue({ id: '1' });
    const result = await controller.create(dto, mockReq);
    expect(mockService.create).toHaveBeenCalledWith(dto, 't1');
    expect(result.id).toBe('1');
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    const result = await controller.remove('1', mockReq);
    expect(mockService.remove).toHaveBeenCalledWith('1', 't1');
    expect(result.id).toBe('1');
  });
});
