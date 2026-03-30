import { Test, TestingModule } from '@nestjs/testing';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';

describe('WidgetController', () => {
  let controller: WidgetController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'widget-1', name: 'W' }),
      findAllForDashboard: jest.fn().mockResolvedValue([{ id: 'widget-1' }]),
      getWidgetData: jest.fn().mockResolvedValue({ labels: [], datasets: [] }),
      updatePosition: jest.fn().mockResolvedValue({ id: 'widget-1', positionX: 2 }),
      remove: jest.fn().mockResolvedValue({ id: 'widget-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WidgetController],
      providers: [{ provide: WidgetService, useValue: service }],
    }).compile();

    controller = module.get<WidgetController>(WidgetController);
  });

  it('should create a widget', async () => {
    const result = await controller.create('tenant-1', 'dash-1', { name: 'W', type: 'LINE_CHART' as never });
    expect(result.id).toBe('widget-1');
    expect(service.create).toHaveBeenCalledWith('tenant-1', 'dash-1', { name: 'W', type: 'LINE_CHART' });
  });

  it('should list widgets for a dashboard', async () => {
    const result = await controller.findAll('tenant-1', 'dash-1');
    expect(result).toHaveLength(1);
    expect(service.findAllForDashboard).toHaveBeenCalledWith('tenant-1', 'dash-1');
  });

  it('should get widget data', async () => {
    const result = await controller.getWidgetData('tenant-1', 'widget-1');
    expect(result).toBeDefined();
    expect(service.getWidgetData).toHaveBeenCalledWith('tenant-1', 'widget-1');
  });

  it('should update widget position', async () => {
    const result = await controller.updatePosition('tenant-1', 'widget-1', { positionX: 2 });
    expect(result.positionX).toBe(2);
    expect(service.updatePosition).toHaveBeenCalledWith('tenant-1', 'widget-1', { positionX: 2 });
  });

  it('should remove a widget', async () => {
    const result = await controller.remove('tenant-1', 'widget-1');
    expect(result.id).toBe('widget-1');
    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'widget-1');
  });
});
