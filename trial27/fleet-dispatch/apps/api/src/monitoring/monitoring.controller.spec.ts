// TRACED: FD-MON-001 — Monitoring controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  isHealthy: jest.fn(),
  vehicle: { count: jest.fn() },
  driver: { count: jest.fn() },
  dispatchJob: { count: jest.fn() },
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

  describe('health', () => {
    it('should return ok status', () => {
      const result = controller.health();

      expect(result.status).toBe('ok');
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('ready', () => {
    it('should return ok when database is healthy', async () => {
      mockPrisma.isHealthy.mockResolvedValue(true);

      const result = await controller.ready();

      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
    });

    it('should return degraded when database is unhealthy', async () => {
      mockPrisma.isHealthy.mockResolvedValue(false);

      const result = await controller.ready();

      expect(result.status).toBe('degraded');
      expect(result.database).toBe('disconnected');
    });
  });

  describe('metrics', () => {
    it('should return metrics', async () => {
      mockPrisma.vehicle.count.mockResolvedValue(5);
      mockPrisma.driver.count.mockResolvedValue(3);
      mockPrisma.dispatchJob.count.mockResolvedValue(10);

      const result = await controller.metrics({} as unknown as import('express').Request, 'test-tenant-id');

      expect(result.vehicles).toBe(5);
      expect(result.drivers).toBe(3);
      expect(result.dispatchJobs).toBe(10);
      expect(result.uptime).toBeDefined();
    });
  });
});
