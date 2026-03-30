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
    it('should return health status with ok and version', () => {
      const result = service.getHealth();

      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });

  describe('getReady', () => {
    it('should return connected when database is reachable', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.getReady();

      expect(result.database).toBe('connected');
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should return disconnected when database is unreachable', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await service.getReady();

      expect(result.database).toBe('disconnected');
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('getMetrics', () => {
    it('should return initial metrics with zero counts', () => {
      const result = service.getMetrics();

      expect(result.requests).toBe(0);
      expect(result.errors).toBe(0);
      expect(result.averageResponseTime).toBe(0);
      expect(result).toHaveProperty('uptime');
    });
  });

  describe('recordRequest', () => {
    it('should increment request count and track response time', () => {
      service.recordRequest(50, false);
      service.recordRequest(100, false);

      const metrics = service.getMetrics();

      expect(metrics.requests).toBe(2);
      expect(metrics.errors).toBe(0);
      expect(metrics.averageResponseTime).toBe(75);
    });

    it('should track error count when isError is true', () => {
      service.recordRequest(200, true);

      const metrics = service.getMetrics();

      expect(metrics.requests).toBe(1);
      expect(metrics.errors).toBe(1);
    });
  });
});
