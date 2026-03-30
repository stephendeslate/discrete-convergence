import { Test, TestingModule } from '@nestjs/testing';
import { DataController } from './data.controller';
import { DataService } from './data.service';

describe('DataController', () => {
  let controller: DataController;
  let service: { preview: jest.Mock; getWidgetData: jest.Mock };
  const mockReq = { user: { userId: 'u1', tenantId: 't1', role: 'USER' } };

  beforeEach(async () => {
    service = {
      preview: jest.fn().mockResolvedValue([]),
      getWidgetData: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [{ provide: DataService, useValue: service }],
    }).compile();

    controller = module.get<DataController>(DataController);
  });

  it('should call preview with parsed limit', async () => {
    await controller.preview(mockReq as never, 'ds1', '5');
    expect(service.preview).toHaveBeenCalledWith('t1', 'ds1', 5);
  });

  it('should call getWidgetData with correct params', async () => {
    await controller.widgetData(mockReq as never, 'd1', 'w1');
    expect(service.getWidgetData).toHaveBeenCalledWith('t1', 'd1', 'w1');
  });

  it('should call preview with undefined limit when not provided', async () => {
    await controller.preview(mockReq as never, 'ds1', undefined);
    expect(service.preview).toHaveBeenCalledWith('t1', 'ds1', undefined);
  });
});
