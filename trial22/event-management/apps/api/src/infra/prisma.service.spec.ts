import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    service.$connect = jest.fn();
    service.$disconnect = jest.fn();
    service.$executeRaw = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.onModuleInit).toBeDefined();
  });

  it('should connect on module init', async () => {
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalledTimes(1);
  });

  it('should disconnect on module destroy', async () => {
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('should set tenant context with parameterized query', async () => {
    await service.setTenantContext('tenant-456');
    expect(service.$executeRaw).toHaveBeenCalledTimes(1);
    expect(service.$executeRaw).toHaveBeenCalledWith(
      expect.objectContaining({ strings: expect.any(Array) }),
    );
  });
});
