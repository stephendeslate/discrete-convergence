import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

describe('WidgetController', () => {
  let controller: WidgetController;
  let service: {
    create: jest.Mock;
    findByDashboard: jest.Mock;
    getWidgetData: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockReq = { user: { tenantId: 'tenant-1' } } as unknown as Request;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findByDashboard: jest.fn(),
      getWidgetData: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WidgetController],
      providers: [{ provide: WidgetService, useValue: service }],
    }).compile();

    controller = module.get<WidgetController>(WidgetController);
  });

  it('should call create with tenantId, dashboardId, and dto', async () => {
    const dto = { name: 'Widget 1', type: 'CHART' };
    service.create.mockResolvedValue({ id: 'w-1', ...dto });

    await controller.create(mockReq, 'dash-1', dto as unknown as CreateWidgetDto);

    expect(service.create).toHaveBeenCalledWith('tenant-1', 'dash-1', dto);
  });

  it('should call findByDashboard with tenantId and dashboardId', async () => {
    service.findByDashboard.mockResolvedValue([]);

    await controller.findByDashboard(mockReq, 'dash-1');

    expect(service.findByDashboard).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });

  it('should call getWidgetData with tenantId and widgetId', async () => {
    service.getWidgetData.mockResolvedValue({ widgetId: 'w-1', data: [] });

    await controller.getWidgetData(mockReq, 'w-1');

    expect(service.getWidgetData).toHaveBeenCalledWith('tenant-1', 'w-1');
  });

  it('should call update with tenantId, widgetId, and dto', async () => {
    const dto = { name: 'Updated Widget' };
    service.update.mockResolvedValue({ id: 'w-1', name: 'Updated Widget' });

    await controller.update(mockReq, 'w-1', dto as unknown as UpdateWidgetDto);

    expect(service.update).toHaveBeenCalledWith('tenant-1', 'w-1', dto);
  });

  it('should call remove with tenantId and widgetId', async () => {
    service.remove.mockResolvedValue({ id: 'w-1' });

    await controller.remove(mockReq, 'w-1');

    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'w-1');
  });
});
