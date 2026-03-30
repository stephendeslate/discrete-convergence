import { MetricsController } from './metrics.controller';

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(() => {
    controller = new MetricsController();
  });

  it('should return uptime and timestamp', () => {
    const result = controller.metrics();
    expect(typeof result.uptime).toBe('number');
    expect(result.timestamp).toBeDefined();
  });
});
