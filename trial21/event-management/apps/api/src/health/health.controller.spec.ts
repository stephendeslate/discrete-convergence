import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return ok status with version and timestamp', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
    expect(result.version).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it('should return ready status', () => {
    const result = controller.ready();
    expect(result.status).toBe('ready');
  });
});
