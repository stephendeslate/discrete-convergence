import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../infra/prisma.service';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let prisma: { healthCheck: jest.Mock };

  beforeEach(async () => {
    prisma = {
      healthCheck: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
  });

  it('should return healthy status when database is up', async () => {
    prisma.healthCheck.mockResolvedValue(true);

    const result = await service.getHealth();

    expect(result.status).toBe('ok');
    expect(result.checks.database).toBe(true);
    expect(result.version).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it('should return degraded status when database is down', async () => {
    prisma.healthCheck.mockResolvedValue(false);

    const result = await service.getHealth();

    expect(result.status).toBe('degraded');
    expect(result.checks.database).toBe(false);
  });

  it('should return metrics with uptime and memory', () => {
    const result = service.getMetrics();

    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(result.memory.rss).toBeGreaterThan(0);
    expect(result.memory.heapTotal).toBeGreaterThan(0);
    expect(result.memory.heapUsed).toBeGreaterThan(0);
    expect(result.timestamp).toBeDefined();
  });
});
