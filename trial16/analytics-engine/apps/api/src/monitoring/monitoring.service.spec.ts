import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../infra/prisma.service';

jest.mock('@analytics-engine/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
  ALLOWED_REGISTRATION_ROLES: ['user', 'admin'],
}));

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should return status ok with APP_VERSION', () => {
      const result = service.getHealth();

      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });

  describe('getReady', () => {
    it('should return ready when database is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.getReady();

      expect(result).toEqual({ status: 'ready', database: 'connected' });
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should return not_ready when database query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await service.getReady();

      expect(result).toEqual({ status: 'not_ready', database: 'disconnected' });
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('recordRequest + getMetrics', () => {
    it('should track requests and calculate average response time', () => {
      service.recordRequest(100);
      service.recordRequest(200);

      const metrics = service.getMetrics();

      expect(metrics.requests).toBe(2);
      expect(metrics.averageResponseTime).toBe(150);
      expect(metrics).toHaveProperty('uptime');
    });
  });

  describe('recordError', () => {
    it('should increment error count', () => {
      service.recordError();
      service.recordError();

      const metrics = service.getMetrics();

      expect(metrics.errors).toBe(2);
    });
  });
});
