import { Test } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(MonitoringService);
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should return health status with ok', () => {
      const result = service.getHealth();

      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
    });

    it('should include APP_VERSION from shared package', () => {
      const result = service.getHealth();
      expect(result.version).toBe('1.0.0');
    });
  });

  describe('getReady', () => {
    it('should return connected when database is available', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.getReady();

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(result.database).toBe('connected');
    });

    it('should return disconnected when database fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await service.getReady();

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(result.database).toBe('disconnected');
    });
  });

  describe('getMetrics', () => {
    it('should return initial metrics with zero counts', () => {
      const result = service.getMetrics();

      expect(result.requestCount).toBe(0);
      expect(result.errorCount).toBe(0);
      expect(result.averageResponseTime).toBe(0);
      expect(result).toHaveProperty('uptime');
    });
  });

  describe('recordRequest', () => {
    it('should increment request count and track response time', () => {
      service.recordRequest(100);
      service.recordRequest(200);

      const metrics = service.getMetrics();

      expect(metrics.requestCount).toBe(2);
      expect(metrics.averageResponseTime).toBe(150);
    });
  });

  describe('recordError', () => {
    it('should increment error count', () => {
      service.recordError();
      service.recordError();

      const metrics = service.getMetrics();

      expect(metrics.errorCount).toBe(2);
    });
  });
});
