// Unit tests
import { Test } from '@nestjs/testing';
import { MonitoringController, MetricsController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
            healthCheck: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
      expect(result.version).toBeDefined();
    });
  });

  describe('getReady', () => {
    it('should return ready status', async () => {
      const result = await controller.getReady();
      expect(result.status).toBe('ready');
      expect(result.database).toBe('connected');
    });
  });
});

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MetricsController],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  describe('getMetrics', () => {
    it('should return metrics', () => {
      const result = controller.getMetrics();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.memoryUsage).toBeDefined();
    });
  });
});
