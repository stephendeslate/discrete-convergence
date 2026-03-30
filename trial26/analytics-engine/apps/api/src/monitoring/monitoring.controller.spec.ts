import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
          },
        },
      ],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
  });

  it('should return health status', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('timestamp');
  });

  it('should return ready status with database connected', async () => {
    const result = await controller.ready();
    expect(result.status).toBe('ready');
    expect(result.database).toBe('connected');
  });

  it('should return metrics with tenant context', () => {
    const result = controller.metrics('tenant-1');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('memory');
    expect(result.tenantId).toBe('tenant-1');
  });
});
