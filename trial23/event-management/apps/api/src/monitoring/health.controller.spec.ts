import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { MonitoringService } from './monitoring.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: {
    getHealth: jest.Mock;
    getReadiness: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getHealth: jest.fn(),
      getReadiness: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: MonitoringService, useValue: service }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return health status', () => {
    const health = { status: 'ok', timestamp: '2026-03-25T00:00:00Z', uptime: 100, version: '0.1.0' };
    service.getHealth.mockReturnValue(health);

    const result = controller.getHealth();
    expect(result).toEqual(health);
    expect(result.status).toBe('ok');
    expect(result.version).toBe('0.1.0');
  });

  it('should return readiness status', () => {
    const ready = { status: 'ok', timestamp: '2026-03-25T00:00:00Z', uptime: 100, version: '0.1.0' };
    service.getReadiness.mockReturnValue(ready);

    const result = controller.getReady();
    expect(result).toEqual(ready);
  });

  it('should include all required fields in health response', () => {
    const health = { status: 'ok', timestamp: '2026-03-25T00:00:00Z', uptime: 50, version: '0.1.0' };
    service.getHealth.mockReturnValue(health);

    const result = controller.getHealth();
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('version');
  });
});
