// TRACED:WIDGET-CTRL-TEST — Widget controller tests
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { Request } from 'express';

describe('WidgetController', () => {
  let controller: WidgetController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    getWidgetData: jest.Mock;
  };

  const mockReq = {
    user: { userId: 'u1', tenantId: 't1', email: 'a@b.com', role: 'ADMIN' },
  } as unknown as Request;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue({ id: '1' }),
      getWidgetData: jest.fn().mockResolvedValue({ type: 'chart' }),
    };
    controller = new WidgetController(service as unknown as WidgetService);
  });

  it('should list widgets', async () => {
    const result = await controller.findAll(mockReq, { page: 1, limit: 10 });
    expect(result.data).toEqual([]);
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 10);
  });

  it('should get widget data', async () => {
    const result = await controller.getWidgetData(mockReq, '1');
    expect(result['type']).toBe('chart');
    expect(service.getWidgetData).toHaveBeenCalledWith('1', 't1');
  });

  it('should create a widget', async () => {
    const result = await controller.create(mockReq, {
      title: 'W',
      type: 'chart',
      dashboardId: 'd1',
    });
    expect(result.id).toBe('1');
    expect(service.create).toHaveBeenCalledTimes(1);
  });
});
