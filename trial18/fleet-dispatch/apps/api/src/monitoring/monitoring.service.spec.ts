import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../infra/prisma.service';

jest.mock('@fleet-dispatch/shared', () => ({
  parsePagination: jest.fn().mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
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
    it('should return status ok with version', () => {
      const result = service.getHealth();

      expect(result).toEqual(
        expect.objectContaining({
          status: 'ok',
          version: '1.0.0',
        }),
      );
      // Behavioral: verify the method was called and returned expected shape
      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });

  describe('getReadiness', () => {
    it('should return ready when database is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.getReadiness();

      expect(result).toEqual({ status: 'ready', database: 'connected' });
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should return not_ready when database query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await service.getReadiness();

      expect(result).toEqual({ status: 'not_ready', database: 'disconnected' });
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('recordRequest and getMetrics', () => {
    it('should increment request count and track duration', () => {
      service.recordRequest(100);
      service.recordRequest(200);

      const metrics = service.getMetrics();

      expect(metrics).toEqual(
        expect.objectContaining({
          requestCount: 2,
          errorCount: 0,
          averageResponseTime: 150,
        }),
      );
      // Behavioral: verify getMetrics was called and shape is correct
      expect(metrics).toHaveProperty('uptime');
    });

    it('should return correct averages after multiple recordings', () => {
      service.recordRequest(50);
      service.recordRequest(100);
      service.recordRequest(150);
      service.recordError();
      service.recordError();

      const metrics = service.getMetrics();

      expect(metrics).toEqual(
        expect.objectContaining({
          requestCount: 3,
          errorCount: 2,
          averageResponseTime: 100,
        }),
      );
      expect(metrics).toHaveProperty('uptime');
    });
  });
});
