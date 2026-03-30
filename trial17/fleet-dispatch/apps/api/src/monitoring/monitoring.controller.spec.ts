import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

const mockService = {
  getHealth: jest.fn(),
  getReadiness: jest.fn(),
  getMetrics: jest.fn(),
};

describe('MonitoringController', () => {
  let controller: MonitoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [{ provide: MonitoringService, useValue: mockService }],
    }).compile();
    controller = module.get<MonitoringController>(MonitoringController);
    jest.clearAllMocks();
  });

  it('should call getHealth on service', () => {
    mockService.getHealth.mockReturnValue({ status: 'ok' });
    const result = controller.getHealth();
    expect(result).toEqual({ status: 'ok' });
    expect(mockService.getHealth).toHaveBeenCalledWith();
  });

  it('should call getReadiness on service', async () => {
    mockService.getReadiness.mockResolvedValue({ status: 'ready' });
    const result = await controller.getReadiness();
    expect(result).toEqual({ status: 'ready' });
    expect(mockService.getReadiness).toHaveBeenCalledWith();
  });

  it('should call getMetrics on service', () => {
    mockService.getMetrics.mockReturnValue({ requestCount: 0 });
    const result = controller.getMetrics();
    expect(result).toEqual({ requestCount: 0 });
    expect(mockService.getMetrics).toHaveBeenCalledWith();
  });
});
