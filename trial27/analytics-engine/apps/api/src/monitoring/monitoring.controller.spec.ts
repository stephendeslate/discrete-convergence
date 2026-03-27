import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
  });

  describe('getHealth', () => {
    it('should return health status ok', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('analytics-engine-api');
    });
  });

  describe('getHealthReady', () => {
    it('should return ok when database is connected', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.getHealthReady();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
    });

    it('should return degraded when database is disconnected', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.getHealthReady();
      expect(result.status).toBe('degraded');
      expect(result.database).toBe('disconnected');
    });
  });

  describe('getMetrics', () => {
    it('should return metrics with uptime', () => {
      const mockReq = { user: { tenantId: 'tenant-1' } } as unknown as import('express').Request;
      const result = controller.getMetrics(mockReq);
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.memory).toBeDefined();
      expect(result.tenantId).toBe('tenant-1');
    });
  });
});
