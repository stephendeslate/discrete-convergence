import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../infra/prisma.service';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let prisma: {
    tenant: { count: jest.Mock };
    dashboard: { count: jest.Mock };
    widget: { count: jest.Mock };
    dataSource: { count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      tenant: { count: jest.fn().mockResolvedValue(5) },
      dashboard: { count: jest.fn().mockResolvedValue(10) },
      widget: { count: jest.fn().mockResolvedValue(50) },
      dataSource: { count: jest.fn().mockResolvedValue(20) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
  });

  it('should return metrics', async () => {
    const result = await service.getMetrics();
    expect(result.tenants).toBe(5);
    expect(result.dashboards).toBe(10);
    expect(result.widgets).toBe(50);
    expect(result.dataSources).toBe(20);
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('memory');
  });
});
