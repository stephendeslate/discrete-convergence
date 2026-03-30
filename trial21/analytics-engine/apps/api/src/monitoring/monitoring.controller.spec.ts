import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let service: { getMetrics: jest.Mock };

  beforeEach(async () => {
    service = {
      getMetrics: jest.fn().mockResolvedValue({ tenants: 5 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [{ provide: MonitoringService, useValue: service }],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
  });

  it('should return metrics', async () => {
    const result = await controller.getMetrics();
    expect(result.tenants).toBe(5);
    expect(service.getMetrics).toHaveBeenCalled();
  });
});
