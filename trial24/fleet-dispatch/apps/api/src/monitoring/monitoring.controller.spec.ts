// TRACED:API-MONITORING-CONTROLLER-SPEC
import { Test } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('MonitoringController', () => {
  let controller: MonitoringController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    controller = module.get(MonitoringController);
  });

  describe('GET /health', () => {
    it('returns ok status', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('returns ok when database is connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      const result = await controller.ready();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
    });

    it('throws ServiceUnavailableException when database is down', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
      await expect(controller.ready()).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
