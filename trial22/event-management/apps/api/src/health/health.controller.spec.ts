import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
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

  it('should return ok status', () => {
    const result = controller.check();
    expect(result).toEqual({ status: 'ok' });
    expect(result.status).toBe('ok');
  });

  it('should return database connected on ready', async () => {
    const result = await controller.ready();
    expect(result).toEqual({ database: 'connected' });
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
  });
});
