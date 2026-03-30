import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../infra/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();
    controller = module.get(HealthController);
  });

  it('should be defined', () => { expect(controller).toBeDefined(); });

  it('check returns ok status', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(result).toHaveProperty('timestamp');
  });

  it('ready returns ok when database is connected', async () => {
    const result = await controller.ready();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
  });

  it('ready returns error when database is disconnected', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
    const result = await controller.ready();
    expect(result.status).toBe('error');
    expect(result.database).toBe('disconnected');
  });
});
