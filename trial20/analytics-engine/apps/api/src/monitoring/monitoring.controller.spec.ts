import { Test } from '@nestjs/testing';
import { HealthController, MetricsController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

const mockService = {
  getHealth: jest.fn(),
  getReady: jest.fn(),
  getMetrics: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: MonitoringService, useValue: mockService }],
    }).compile();

    controller = module.get(HealthController);
    jest.clearAllMocks();
  });

  it('should return health status', () => {
    mockService.getHealth.mockReturnValue({ status: 'ok' });

    const result = controller.getHealth();

    expect(mockService.getHealth).toHaveBeenCalled();
    expect(result).toEqual({ status: 'ok' });
  });

  it('should return readiness status', async () => {
    mockService.getReady.mockResolvedValue({ database: 'connected' });

    const result = await controller.getReady();

    expect(mockService.getReady).toHaveBeenCalled();
    expect(result).toEqual({ database: 'connected' });
  });
});

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [{ provide: MonitoringService, useValue: mockService }],
    }).compile();

    controller = module.get(MetricsController);
    jest.clearAllMocks();
  });

  it('should return metrics data', () => {
    mockService.getMetrics.mockReturnValue({ requestCount: 10 });

    const result = controller.getMetrics();

    expect(mockService.getMetrics).toHaveBeenCalled();
    expect(result).toEqual({ requestCount: 10 });
  });
});
