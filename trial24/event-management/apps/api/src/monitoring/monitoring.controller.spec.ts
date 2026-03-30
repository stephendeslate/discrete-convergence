// TRACED:MONITORING-CONTROLLER-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.module';
import { APP_VERSION } from '@em/shared';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('MonitoringController', () => {
  let controller: MonitoringController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
  });

  describe('GET /health', () => {
    it('should return ok status with version', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result.version).toBe(APP_VERSION);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('should return connected when database is available', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      const result = await controller.ready();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
    });

    it('should return disconnected when database is unavailable', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
      const result = await controller.ready();
      expect(result.status).toBe('error');
      expect(result.database).toBe('disconnected');
    });

    it('should include timestamp in response', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      const result = await controller.ready();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });
});
