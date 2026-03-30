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

  it('should return health status ok', () => {
    const result = controller.getHealth();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('should return version in health response', () => {
    const result = controller.getHealth();
    expect(result.version).toBeDefined();
    expect(result.uptime).toBeDefined();
  });

  it('should return connected when db is available', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
    const result = await controller.getReady();
    expect(result.database).toBe('connected');
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
  });

  it('should return disconnected when db is unavailable', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('DB down'));
    const result = await controller.getReady();
    expect(result.database).toBe('disconnected');
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
  });
});

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(() => {
    controller = new MetricsController();
  });

  it('should return initial metrics', () => {
    const result = controller.getMetrics();
    expect(result.requests).toBe(0);
    expect(result.errors).toBe(0);
  });

  it('should track request metrics', () => {
    controller.recordRequest(50, false);
    controller.recordRequest(100, true);
    const result = controller.getMetrics();
    expect(result.requests).toBe(2);
    expect(result.errors).toBe(1);
  });
});
