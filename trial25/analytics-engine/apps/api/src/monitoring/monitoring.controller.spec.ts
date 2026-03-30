// TRACED:MON-CTRL-TEST — Monitoring controller tests
import { MonitoringController, MetricsAliasController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(() => {
    prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    controller = new MonitoringController(prisma as unknown as PrismaService);
  });

  it('should return health status', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('should return ready status when db is connected', async () => {
    const result = await controller.ready();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
  });

  it('should return degraded status when db fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));
    const result = await controller.ready();
    expect(result.status).toBe('degraded');
    expect(result.database).toBe('disconnected');
  });

  it('should return metrics', () => {
    const result = controller.metrics();
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(result.memory).toBeDefined();
    expect(result.memory.heapUsed).toBeGreaterThan(0);
  });
});

describe('MetricsAliasController', () => {
  it('should return metrics', () => {
    const controller = new MetricsAliasController();
    const result = controller.metrics();
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(result.memory).toBeDefined();
  });
});
