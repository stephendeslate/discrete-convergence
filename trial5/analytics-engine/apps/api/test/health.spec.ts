import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { MonitoringService } from '../src/monitoring/monitoring.service';
import { PrismaService } from '../src/common/prisma.service';

describe('MonitoringService', () => {
  let service: MonitoringService;

  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
  });

  describe('getHealth', () => {
    it('should return healthy status when DB is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const result = await service.getHealth();

      expect(result.status).toBe('healthy');
      expect(result.database).toBe('connected');
      // Version is pulled from shared constants, not hardcoded
      expect(result.version).toMatch(/^\d+\.\d+\.\d+$/);
      // Timestamp should be a valid ISO string
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should return degraded status when DB is disconnected', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await service.getHealth();

      expect(result.status).toBe('degraded');
      expect(result.database).toBe('disconnected');
    });
  });

  describe('getMetrics', () => {
    it('should return memory metrics with all expected fields', async () => {
      const result = await service.getMetrics();

      expect(result.uptime).toBeGreaterThan(0);
      expect(result.memoryUsage.rss).toBeGreaterThan(0);
      expect(result.memoryUsage.heapUsed).toBeGreaterThan(0);
      expect(result.memoryUsage.heapTotal).toBeGreaterThan(0);
      // heapUsed should always be <= heapTotal — this is a computed relationship check
      expect(result.memoryUsage.heapUsed).toBeLessThanOrEqual(result.memoryUsage.heapTotal);
    });
  });
});
