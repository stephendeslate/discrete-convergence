import { Test } from '@nestjs/testing';
import { HealthController, MetricsController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    controller = module.get(HealthController);
    jest.clearAllMocks();
  });

  it('should return health status with ok', () => {
    const result = controller.getHealth();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('timestamp');
  });

  it('should return database connected on ready', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    const result = await controller.getReady();
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    expect(result).toHaveProperty('database', 'connected');
  });

  it('should return database disconnected on error', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));
    const result = await controller.getReady();
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    expect(result).toHaveProperty('database', 'disconnected');
  });
});

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [MetricsController],
    }).compile();
    controller = module.get(MetricsController);
  });

  it('should return metrics with zero initial values', () => {
    const result = controller.getMetrics();
    expect(result).toHaveProperty('requests', 0);
    expect(result).toHaveProperty('errors', 0);
  });

  it('should increment request count', () => {
    controller.incrementRequest(10);
    const result = controller.getMetrics();
    expect(result.requests).toBe(1);
    expect(result.averageResponseTime).toBe(10);
  });
});
