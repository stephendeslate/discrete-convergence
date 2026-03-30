import { MonitoringService } from '../src/monitoring/monitoring.service';
import { PrismaService } from '../src/common/prisma.service';
import { mockPrismaService, resetMocks } from './helpers/setup';
import { Test } from '@nestjs/testing';

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(async () => {
    resetMocks();
    const module = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get(MonitoringService);
  });

  describe('getHealth', () => {
    it('should return status ok with version and uptime', () => {
      const result = service.getHealth();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should return increasing uptime on subsequent calls', () => {
      const first = service.getHealth();
      const second = service.getHealth();
      expect(second.uptime).toBeGreaterThanOrEqual(first.uptime);
    });
  });

  describe('getReadiness', () => {
    it('should return ready when database is available', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.getReadiness();
      expect(result.status).toBe('ready');
      expect(result.database).toBe('ok');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should return not_ready when database is unavailable', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await service.getReadiness();
      expect(result.status).toBe('not_ready');
      expect(result.database).toBe('unavailable');
    });
  });
});
