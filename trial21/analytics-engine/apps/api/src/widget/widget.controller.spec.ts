import { Test, TestingModule } from '@nestjs/testing';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { WidgetType } from '@prisma/client';

describe('WidgetController', () => {
  let controller: WidgetController;
  let service: { create: jest.Mock; findAll: jest.Mock; findOne: jest.Mock; update: jest.Mock; remove: jest.Mock };

  const mockReq = { user: { userId: 'u1', tenantId: 't1', role: 'USER' } };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'w1' }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 'w1' }),
      update: jest.fn().mockResolvedValue({ id: 'w1' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WidgetController],
      providers: [{ provide: WidgetService, useValue: service }],
    }).compile();

    controller = module.get<WidgetController>(WidgetController);
  });

  it('should create widget', async () => {
    await controller.create(mockReq as never, 'd1', { title: 'W', type: WidgetType.BAR_CHART });
    expect(service.create).toHaveBeenCalledWith('t1', 'd1', expect.objectContaining({ title: 'W' }));
  });

  it('should find all widgets for dashboard', async () => {
    await controller.findAll(mockReq as never, 'd1');
    expect(service.findAll).toHaveBeenCalledWith('t1', 'd1');
  });

  it('should find one widget', async () => {
    await controller.findOne(mockReq as never, 'd1', 'w1');
    expect(service.findOne).toHaveBeenCalledWith('t1', 'd1', 'w1');
  });

  it('should remove widget', async () => {
    await controller.remove(mockReq as never, 'd1', 'w1');
    expect(service.remove).toHaveBeenCalledWith('t1', 'd1', 'w1');
  });
});
