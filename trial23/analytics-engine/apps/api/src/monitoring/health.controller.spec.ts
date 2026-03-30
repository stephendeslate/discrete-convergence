import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(HealthController);
  });

  describe('getHealth', () => {
    it('should return health status with version and uptime', () => {
      const result = controller.getHealth();

      expect(result.status).toBe('ok');
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getReady', () => {
    it('should return connected when database responds', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.getReady();

      expect(result.database).toBe('connected');
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('should return disconnected when database fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.getReady();

      expect(result.database).toBe('disconnected');
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
