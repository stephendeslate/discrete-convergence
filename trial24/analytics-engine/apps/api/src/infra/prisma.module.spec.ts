// TRACED:PRISMA-MODULE-SPEC
import { PrismaService } from './prisma.module';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
    // Mock the underlying PrismaClient methods
    service.$connect = jest.fn().mockResolvedValue(undefined);
    service.$disconnect = jest.fn().mockResolvedValue(undefined);
    service.$executeRaw = jest.fn().mockResolvedValue(undefined);
  });

  it('should call $connect on module init', async () => {
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should call $disconnect on module destroy', async () => {
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });

  it('should set tenant ID via raw SQL', async () => {
    await service.setTenantId('tenant-123');
    expect(service.$executeRaw).toHaveBeenCalled();
  });
});
