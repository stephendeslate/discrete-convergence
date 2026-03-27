// TRACED: EM-MON-001 — Monitoring controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
  });

  describe('health', () => {
    it('should return ok status with version and uptime', async () => {
      const result = await controller.health();
      expect(result.status).toBe('ok');
      expect(result.version).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ready', () => {
    it('should return ok when database is connected', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.ready();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should return degraded when database is disconnected', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.ready();
      expect(result.status).toBe('degraded');
      expect(result.database).toBe('disconnected');
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('metrics', () => {
    it('should return metrics with tenant scoping', async () => {
      const mockReq = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'test@test.com', role: 'ADMIN' } } as unknown as import('express').Request;
      const result = await controller.metrics(mockReq);
      expect(result.tenantId).toBe('tenant-1');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.version).toBeDefined();
      expect(result.memoryUsage).toBeDefined();
      expect(result.timestamp).toContain('T');
    });
  });
});
