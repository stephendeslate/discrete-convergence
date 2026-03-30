import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.service';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('MonitoringController', () => {
  let controller: MonitoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should return status ok with version', () => {
      const spy = jest.spyOn(controller, 'getHealth');

      const result = controller.getHealth();

      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
      expect(spy).toHaveBeenCalledWith();
    });

    it('should increment requestCount on each call', () => {
      const healthSpy = jest.spyOn(controller, 'getHealth');
      const metricsSpy = jest.spyOn(controller, 'getMetrics');

      controller.getHealth();
      const metrics = controller.getMetrics();

      // getHealth increments once, getMetrics increments once = 2
      expect(metrics.requestCount).toBe(2);
      expect(healthSpy).toHaveBeenCalledWith();
      expect(metricsSpy).toHaveBeenCalledWith();
    });
  });

  describe('getReady', () => {
    it('should return ready when database is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.getReady();

      expect(result).toEqual({ status: 'ready', database: 'connected' });
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
        expect.anything(),
      );
    });

    it('should return not_ready when database query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const result = await controller.getReady();

      expect(result).toEqual({
        status: 'not_ready',
        database: 'disconnected',
      });
      expect(mockPrisma.$queryRaw).toHaveBeenCalledWith(
        expect.anything(),
      );
    });
  });

  describe('getMetrics', () => {
    it('should return metrics with requestCount, errorCount, averageResponseTime', () => {
      const spy = jest.spyOn(controller, 'getMetrics');

      const result = controller.getMetrics();

      expect(result).toEqual(
        expect.objectContaining({
          requestCount: expect.any(Number),
          errorCount: expect.any(Number),
          averageResponseTime: expect.any(String),
          uptime: expect.any(Number),
        }),
      );
      expect(spy).toHaveBeenCalledWith();
    });
  });
});
