import { Test } from '@nestjs/testing';
import { MonitoringController, MetricsController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('MonitoringController', () => {
  let controller: MonitoringController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    controller = module.get(MonitoringController);
    jest.clearAllMocks();
  });

  it('should return health status with ok', () => {
    const result = controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.version).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it('should return connected when database is reachable', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

    const result = await controller.getReady();

    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    expect(result.database).toBe('connected');
  });

  it('should return disconnected when database is unreachable', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('connection failed'));

    const result = await controller.getReady();

    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    expect(result.database).toBe('disconnected');
  });
});

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MetricsController],
    }).compile();
    controller = module.get(MetricsController);
  });

  it('should return metrics with uptime', () => {
    const result = controller.getMetrics();

    expect(result.uptime).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });
});
