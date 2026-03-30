// TRACED:TEST-MONITORING-CTRL — Monitoring controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from '../infra/prisma.service';

describe('MonitoringController', () => {
  let controller: MonitoringController;
  let mockPrisma: { $queryRaw: jest.Mock };
  const mockReq = { user: { tenantId: 'test-tenant' } } as unknown as Request;

  beforeEach(async () => {
    mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
  });

  it('should return health status with valid structure', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return ready status when database connected', async () => {
    const result = await controller.ready();
    expect(result.status).toBe('ready');
    expect(result.database).toBe('connected');
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
  });

  it('should return not_ready when database disconnected', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

    const result = await controller.ready();

    expect(result.status).toBe('not_ready');
    expect(result.database).toBe('disconnected');
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
  });

  it('should return metrics with valid memory values', () => {
    const result = controller.metrics();
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(result.memory.rss).toBeGreaterThan(0);
    expect(result.memory.heapUsed).toBeGreaterThan(0);
    expect(result.memory.heapTotal).toBeGreaterThan(0);
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should return empty dashboards with pagination meta', () => {
    const result = controller.dashboards(mockReq);
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });

  it('should return empty data sources', () => {
    const result = controller.dataSources(mockReq);
    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should return empty metrics endpoint', () => {
    const result = controller.metricsEndpoint(mockReq);
    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should return empty audit logs', () => {
    const result = controller.auditLogs(mockReq);
    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });
});
