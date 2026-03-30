// TRACED:TEST-MONITORING — Unit tests for health endpoints
import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
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

  describe('health', () => {
    it('should return ok status', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('ready', () => {
    it('should return ok when database is connected', async () => {
      const result = await controller.ready();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
    });

    it('should return degraded when database is disconnected', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('connection refused'));
      const result = await controller.ready();
      expect(result.status).toBe('degraded');
      expect(result.database).toBe('disconnected');
    });
  });

  describe('metrics', () => {
    it('should return uptime and memory', () => {
      const result = controller.metrics();
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
    });
  });
});
