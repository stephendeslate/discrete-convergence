import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonitoringService],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
  });

  it('should return health with status, timestamp, uptime, and version', () => {
    const health = service.getHealth();
    expect(health.status).toBe('ok');
    expect(health.timestamp).toBeDefined();
    expect(typeof health.uptime).toBe('number');
    expect(health.version).toBeDefined();
  });

  it('should return readiness with same structure as health', () => {
    const ready = service.getReadiness();
    expect(ready.status).toBe('ok');
    expect(ready.version).toBeDefined();
  });

  it('should record requests and calculate metrics', () => {
    service.recordRequest('GET');
    service.recordRequest('POST');
    service.recordRequest('GET');

    const metrics = service.getMetrics();
    expect(metrics.totalRequests).toBe(3);
    expect(metrics.requestsByMethod['GET']).toBe(2);
    expect(metrics.requestsByMethod['POST']).toBe(1);
  });

  it('should record errors and calculate error rate', () => {
    service.recordRequest('GET');
    service.recordRequest('GET');
    service.recordError(500);

    const metrics = service.getMetrics();
    expect(metrics.totalErrors).toBe(1);
    expect(metrics.errorRate).toBe(0.5);
    expect(metrics.errorsByStatus[500]).toBe(1);
  });
});
